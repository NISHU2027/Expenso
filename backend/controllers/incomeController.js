import incomeModel from "../models/incomeModel.js";
import XLSX from "xlsx";
import getDataRange from "../utils/dataFilter.js";
import { invalidObjectId, parseTransactionInput, serverError } from "../utils/apiResponse.js";

//add 
export async function addIncome(req, res) {
  const userId = req.user._id;
  const { description, amount, category, date } = req.body;

  try {
    const { data, error } = parseTransactionInput({ description, amount, category, date });
    if (error) {
      return res.status(400).json(error);
    }

    const newIncome = new incomeModel({
      userId,
      ...data,
    });

    await newIncome.save();
    res.json({
      success: true,
      message: "Income Added Successfully",
    });
  } catch (error) {
    return serverError(res, error, "addIncome");
  }
}


//to get all income of a user
export async function getAllIncome(req, res) {
    const userId = req.user._id;
    try {
        const income = await incomeModel.find({ userId }).sort({ date: -1 });
        res.json(income);
    } 
    
    catch (error) {
        return serverError(res, error, "getAllIncome");


    }

}

//update income
export async function updateIncome(req, res) {
  const { id } = req.params;
  const userId = req.user._id;
  const { description, amount, category, date } = req.body;

  try {
    const idError = invalidObjectId(id, "income");
    if (idError) {
      return res.status(400).json(idError);
    }

    const { data: update, error } = parseTransactionInput({ description, amount, category, date });
    if (error) {
      return res.status(400).json(error);
    }

    const updated = await incomeModel.findOneAndUpdate(
      { _id: id, userId },
      update,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Income not found",
      });
    }

    res.json({
      success: true,
      message: "Income Updated Successfully",
      data: updated,
    });
  } catch (error) {
    return serverError(res, error, "updateIncome");
  }
}

//delete income
export async function deleteIncome(req, res) {
  const userId = req.user._id;
  try {
    const idError = invalidObjectId(req.params.id, "income");
    if (idError) {
      return res.status(400).json(idError);
    }

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
    return serverError(res, error, "deleteIncome");
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "income");
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="income_details.xlsx"'
    );
    res.send(buffer);
  } catch (error) {
    return serverError(res, error, "downloadIncomeExcel");
  }
}

//to get income overview
export async function getIncomeOverview(req, res) {

    try {
        const userId = req.user._id;
        const {range = "monthly"} = req.query;
        const { start, end } = getDataRange(range);

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
    }

        catch (error) {
            return serverError(res, error, "getIncomeOverview");
        }
}
        
