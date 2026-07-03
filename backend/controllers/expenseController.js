import expenseModel from "../models/expenseModel.js";
import XLSX from "xlsx";
import getDataRange from "../utils/dataFilter.js";
import { invalidObjectId, parseTransactionInput, serverError } from "../utils/apiResponse.js";


//add expense
export async function addExpense(req, res) {
    const userId = req.user._id;
    const { description, amount, category, date } = req.body;   

    try {
        const { data, error } = parseTransactionInput({ description, amount, category, date });
        if (error) {
            return res.status(400).json(error);
        }

        const newExpense = new expenseModel({
            userId,
            ...data,
        });
        await newExpense.save();
        res.json({
            success: true,
            message: "Expense Added Successfully",
        });
    }
    catch (error) {
        return serverError(res, error, "addExpense");
    }
}

//to all expenses of a user
export async function getAllExpense(req, res) {
    const userId = req.user._id;
    try {       
        const expense = await expenseModel.find({ userId }).sort({ date: -1 });
        res.json(expense);
    }   
    catch (error) {
        return serverError(res, error, "getAllExpense");
    }
}

//to update expense
export async function updateExpense(req, res) {
    const { id } = req.params;
    const userId = req.user._id;
    const { description, amount, category, date } = req.body;
    try {
        const idError = invalidObjectId(id, "expense");
        if (idError) {
            return res.status(400).json(idError);
        }

        const { data: update, error } = parseTransactionInput({ description, amount, category, date });
        if (error) {
            return res.status(400).json(error);
        }

        const updatedExpense = await expenseModel.findOneAndUpdate(
            { _id: id, userId },
            update,
            { new: true, runValidators: true }
        );

        if (!updatedExpense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found",
            });
        }   
        res.json({
            success: true,
            message: "Expense Updated Successfully",
            data: updatedExpense,
        });
    } catch (error) {
        return serverError(res, error, "updateExpense");
    }
}

//to delete expense
export async function deleteExpense(req, res) {
    const userId = req.user._id;
  try {
    const idError = invalidObjectId(req.params.id, "expense");
    if (idError) {
      return res.status(400).json(idError);
    }

    const expense = await expenseModel.findOneAndDelete({
      _id: req.params.id,
      userId,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    return res.json({
      success: true,
      message: "Expense Deleted Successfully",
    });
  } catch (error) {
    return serverError(res, error, "deleteExpense");
  }
}

//download expense data in excel format
export async function downloadExpenseExcel(req, res) {
  const userId = req.user._id;
  try {
    const expense = await expenseModel.find({ userId }).sort({ date: -1 });
    const plainData = expense.map((exp) => ({
      Description: exp.description,
      Amount: exp.amount,
      Category: exp.category,
      Date: exp.date.toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(plainData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "expense");
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="expense_details.xlsx"'
    );
    res.send(buffer);
  } catch (error) {
    return serverError(res, error, "downloadExpenseExcel");
  }
}

// backward-compatible alias (if any client still calls the older name)
export const downloadExpense = downloadExpenseExcel;


//to get overview of expense
export async function getExpenseOverview(req, res) {
    try {
        const userId = req.user._id;
        const {range = "monthly"} = req.query;
        const { start, end } = getDataRange(range);

        const expense = await expenseModel
            .find({
                userId,
                date: { $gte: start, $lte: end },
            })
            .sort({ date: -1 });

        const totalExpense = expense.reduce((acc, cur) => acc + cur.amount, 0);
        const averageExpense = expense.length > 0 ? totalExpense / expense.length : 0;
        const numberOfTransactions = expense.length;
        const recentTransactions = expense.slice(0, 5);

        res.json({
            success: true,
            data: {
                totalExpense,
                averageExpense,
                numberOfTransactions,
                recentTransactions,
                range,
            },
        });
    }

        catch (error) {
            return serverError(res, error, "getExpenseOverview");
        }
}
