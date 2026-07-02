import express from 'express'
import authMiddleware from '../middleware/auth.js';
import { addExpense, deleteExpense, downloadExpenseExcel, getAllExpense, getExpenseOverview, updateExpense} from '../controllers/expenseController.js';

const expenseRouter = express.Router();

expenseRouter.post("/add", authMiddleware, addExpense);
expenseRouter.get("/get", authMiddleware, getAllExpense);

expenseRouter.delete("/delete/:id", authMiddleware, deleteExpense);
expenseRouter.put("/update/:id", authMiddleware, updateExpense);

expenseRouter.get("/downloadexcel", authMiddleware, downloadExpenseExcel);
expenseRouter.get("/overview", authMiddleware, getExpenseOverview);

export default expenseRouter;
