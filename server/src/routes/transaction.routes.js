import express from "express";
import {
  findAllTransactions,
  findTransactionById,
  createTransaction,
  deleteTransaction,
  getTransactionSummary,
  getBalanceTrend,
} from "../controllers/transaction.controllers.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All transaction routes are protected
router.use(protect);

router.get("/summary", getTransactionSummary);
router.get("/balance-trend", getBalanceTrend);
router.route("/").get(findAllTransactions).post(createTransaction);
router.route("/:id").get(findTransactionById).delete(deleteTransaction);

export default router;
