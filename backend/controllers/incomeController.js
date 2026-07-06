import incomeModel from "../models/incomeModel.js";
import XLSX from "xlsx";
import getDateRange from "../utils/dataFilter.js";

//add 
export async function addIncome(req, res) {
  const userId = req.user._id;
  const { description, amount, category, date } = req.body;

  try {
    if (!description || !amount || !category || !date) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const newIncome = new incomeModel({
      userId,
      description,
      amount,
      category,
      date: new Date(date)
    });

    await newIncome.save();
    res.json({
      success: true,
      message: "Income Added Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
}


//to get all income of a user
export async function getAllIncome(req, res) {
  const userId = req.user._id;
  try {
    const income = await incomeModel.find({ userId }).sort({ date: -1 });
    // Add type field to each income for frontend compatibility
    const incomesWithType = income.map(inc => ({
      ...inc.toObject(),
      type: "income"
    }));
    res.json(incomesWithType);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
}

//update income
export async function updateIncome(req, res) {
  const { id } = req.params;
  const userId = req.user._id;
  const { description, amount, category, date } = req.body;

  try {
    const updateIncome = await incomeModel.findOneAndUpdate(
      { _id: id, userId },
      { description, amount, category, date: date ? new Date(date) : undefined },
      { new: true }
    );

    if (!updateIncome) {
      return res.status(400).json({
        success: false,
        message: "Income not found"
      });
    }

    res.json({
      success: true,
      message: "Income Updated Successfully",
      data: updateIncome,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
}

//delete income
export async function deleteIncome(req, res) {
  const userId = req.user._id;
  try {
    const income = await incomeModel.findOneAndDelete({
      _id: req.params.id,
      userId,
    });

    if (!income) {
      return res.status(404).json({
        success: false,
        message: "Income not found",
      });
    }

    return res.json({
      success: true,
      message: "Income Deleted Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
}


//to download income data in excel format
export async function downloadIncomeExcel(req, res) {
  const userId = req.user._id;
  try {
    const income = await incomeModel.find({ userId }).sort({ date: -1 });
    const plainData = income.map((inc) => ({
      Description: inc.description,
      Amount: inc.amount,
      Category: inc.category,
      Date: inc.date.toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(plainData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "incomeModel");
    XLSX.writeFile(workbook, "income_details.xlsx");
    res.download("income_details.xlsx");
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
}

//to get income overview
export async function getIncomeOverview(req, res) {
  try {
    const userId = req.user._id;
    const { range = "monthly" } = req.query;
    const { start, end } = getDateRange(range);

    const income = await incomeModel
      .find({
        userId,
        date: { $gte: start, $lte: end },
      })
      .sort({ date: -1 });

    const totalIncome = income.reduce((acc, cur) => acc + cur.amount, 0);
    const averageIncome = income.length > 0 ? totalIncome / income.length : 0;
    const numberOfTransactions = income.length;
    const recentTransactions = income.slice(0, 9);

    res.json({
      success: true,
      data: {
        totalIncome,
        averageIncome,
        numberOfTransactions,
        recentTransactions,
        range,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
}