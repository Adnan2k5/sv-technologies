import express from "express";
import {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getCategoryDetail,
} from "../controllers/expense.controllers.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/category-detail", getCategoryDetail);
router.route("/").get(getExpenses).post(createExpense);
router.route("/:id").get(getExpenseById).patch(updateExpense).delete(deleteExpense);

export default router;
