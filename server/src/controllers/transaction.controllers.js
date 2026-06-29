import Transaction from "../models/transaction.model.js";
import User from "../models/user.model.js";
import Project from "../models/project.model.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

// ─────────────────────────────────────────
// GET /api/transactions
// Query: ?type=credit|debit|project_transfer|project_return
//        &startDate=ISO&endDate=ISO
//        &page=1&limit=20
// ─────────────────────────────────────────
export const findAllTransactions = asyncHandler(async (req, res) => {
  const { type, startDate, endDate, page = 1, limit = 50 } = req.query;

  const filter = { user: req.user.id };
  if (type) filter.type = type;
  if (startDate || endDate) {
    filter.transactionDate = {};
    if (startDate) filter.transactionDate.$gte = new Date(startDate);
    if (endDate) filter.transactionDate.$lte = new Date(endDate);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .populate("project", "name")
      .sort({ transactionDate: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Transaction.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: transactions,
    pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
  });
});

// ─────────────────────────────────────────
// GET /api/transactions/:id
// ─────────────────────────────────────────
export const findTransactionById = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOne({
    _id: req.params.id,
    user: req.user.id,
  }).populate("project", "name");

  if (!transaction) throw new ApiError(404, "Transaction not found");

  res.status(200).json({ success: true, data: transaction });
});

// ─────────────────────────────────────────
// POST /api/transactions
// Creates a credit or debit on the main balance.
// For project_transfer: also updates project.allocatedFunds
// ─────────────────────────────────────────
export const createTransaction = asyncHandler(async (req, res) => {
  const { type, amount, description, project: projectId, transactionDate } = req.body;

  if (!type || !amount) {
    throw new ApiError(400, "Type and amount are required");
  }
  if (amount <= 0) {
    throw new ApiError(400, "Amount must be greater than 0");
  }

  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, "User not found");

  // Balance validation for debit / project_transfer
  if ((type === "debit" || type === "project_transfer") && user.balance < amount) {
    throw new ApiError(400, "Insufficient balance");
  }

  // Update user balance
  if (type === "credit" || type === "project_return") {
    user.balance += amount;
  } else if (type === "debit" || type === "project_transfer") {
    user.balance -= amount;
  }

  // Handle project fund allocation
  let linkedProject = null;
  if (type === "project_transfer" && projectId) {
    linkedProject = await Project.findOne({ _id: projectId, user: req.user.id });
    if (!linkedProject) throw new ApiError(404, "Project not found");
    linkedProject.allocatedFunds += amount;
    await linkedProject.save();
  }
  if (type === "project_return" && projectId) {
    linkedProject = await Project.findOne({ _id: projectId, user: req.user.id });
    if (!linkedProject) throw new ApiError(404, "Project not found");
    if (linkedProject.allocatedFunds < amount) {
      throw new ApiError(400, "Project does not have enough allocated funds to return");
    }
    linkedProject.allocatedFunds -= amount;
    await linkedProject.save();
  }

  await user.save();

  const transaction = await Transaction.create({
    user: req.user.id,
    type,
    amount,
    description,
    project: projectId || null,
    transactionDate: transactionDate || Date.now(),
    balanceAfter: user.balance,
  });

  const populated = await transaction.populate("project", "name");

  res.status(201).json({ success: true, data: populated, balance: user.balance });
});

// ─────────────────────────────────────────
// DELETE /api/transactions/:id
// ─────────────────────────────────────────
export const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user.id });
  if (!transaction) throw new ApiError(404, "Transaction not found");

  // Reverse the balance effect
  const user = await User.findById(req.user.id);
  if (transaction.type === "credit" || transaction.type === "project_return") {
    user.balance -= transaction.amount;
  } else if (transaction.type === "debit" || transaction.type === "project_transfer") {
    user.balance += transaction.amount;
  }

  // Reverse project allocation if applicable
  if (transaction.project) {
    const project = await Project.findById(transaction.project);
    if (project) {
      if (transaction.type === "project_transfer") project.allocatedFunds -= transaction.amount;
      if (transaction.type === "project_return") project.allocatedFunds += transaction.amount;
      await project.save();
    }
  }

  await user.save();
  await transaction.deleteOne();

  res.status(200).json({ success: true, message: "Transaction deleted and balance reversed", balance: user.balance });
});

// ─────────────────────────────────────────
// GET /api/transactions/summary
// Returns totals for dashboard stats
// ─────────────────────────────────────────
export const getTransactionSummary = asyncHandler(async (req, res) => {
  const [summary] = await Transaction.aggregate([
    { $match: { user: req.user._id } },
    {
      $group: {
        _id: null,
        totalCredit: { $sum: { $cond: [{ $in: ["$type", ["credit", "project_return"]] }, "$amount", 0] } },
        totalDebit: { $sum: { $cond: [{ $in: ["$type", ["debit", "project_transfer"]] }, "$amount", 0] } },
        count: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: summary || { totalCredit: 0, totalDebit: 0, count: 0 },
  });
});

// ─────────────────────────────────────────
// GET /api/transactions/balance-trend
// Returns daily balance over last N days for chart
// ─────────────────────────────────────────
export const getBalanceTrend = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const trend = await Transaction.find({
    user: req.user.id,
    transactionDate: { $gte: since },
  })
    .select("transactionDate balanceAfter type amount")
    .sort({ transactionDate: 1 });

  res.status(200).json({ success: true, data: trend });
});