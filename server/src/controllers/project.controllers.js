import Project from "../models/project.model.js";
import Transaction from "../models/transaction.model.js";
import Expense from "../models/expense.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

// ─────────────────────────────────────────
// GET /api/projects
// ─────────────────────────────────────────
export const getProjects = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = { user: req.user.id };
  if (status) filter.status = status;

  const projects = await Project.find(filter).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: projects });
});

// ─────────────────────────────────────────
// POST /api/projects
// Creates a project and optionally transfers funds from the user's balance
// ─────────────────────────────────────────
export const createProject = asyncHandler(async (req, res) => {
  const { name, description, clientName, location, initialFunds = 0 } = req.body;

  if (!name) throw new ApiError(400, "Project name is required");

  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, "User not found");

  if (initialFunds > 0 && user.balance < initialFunds) {
    throw new ApiError(400, "Insufficient balance to allocate initial funds");
  }

  // Create the project
  const project = await Project.create({
    user: req.user.id,
    name,
    description,
    clientName,
    location,
    allocatedFunds: initialFunds,
    spentAmount: 0,
  });

  // Debit initial funds from balance and log as project_transfer
  if (initialFunds > 0) {
    user.balance -= initialFunds;
    await user.save();

    await Transaction.create({
      user: req.user.id,
      type: "project_transfer",
      amount: initialFunds,
      description: `Initial funds allocated to project: ${name}`,
      project: project._id,
      balanceAfter: user.balance,
    });
  }

  res.status(201).json({ success: true, data: project, balance: user.balance });
});

// ─────────────────────────────────────────
// GET /api/projects/:id
// Returns project with expense breakdown
// ─────────────────────────────────────────
export const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, user: req.user.id });
  if (!project) throw new ApiError(404, "Project not found");

  // Expense breakdown by category (for donut chart)
  const breakdown = await Expense.aggregate([
    { $match: { project: project._id } },
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: "$category" },
    {
      $project: {
        categoryId: "$_id",
        categoryName: "$category.name",
        categoryColor: "$category.color",
        categoryIcon: "$category.icon",
        total: 1,
        count: 1,
        _id: 0,
      },
    },
    { $sort: { total: -1 } },
  ]);

  // Recent expenses (last 10)
  const recentExpenses = await Expense.find({ project: project._id })
    .populate("category", "name color icon")
    .sort({ expenseDate: -1 })
    .limit(10);

  // Monthly spend trend
  const monthlyTrend = await Expense.aggregate([
    { $match: { project: project._id } },
    {
      $group: {
        _id: {
          year: { $year: "$expenseDate" },
          month: { $month: "$expenseDate" },
        },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  res.status(200).json({
    success: true,
    data: {
      project,
      breakdown,
      recentExpenses,
      monthlyTrend,
    },
  });
});

// ─────────────────────────────────────────
// PATCH /api/projects/:id
// ─────────────────────────────────────────
export const updateProject = asyncHandler(async (req, res) => {
  const allowed = ["name", "description", "clientName", "location", "status"];
  const updates = {};
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });

  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    updates,
    { new: true, runValidators: true }
  );
  if (!project) throw new ApiError(404, "Project not found");

  res.status(200).json({ success: true, data: project });
});

// ─────────────────────────────────────────
// DELETE /api/projects/:id
// Also deletes associated expenses and reverses allocated funds back to user
// ─────────────────────────────────────────
export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, user: req.user.id });
  if (!project) throw new ApiError(404, "Project not found");

  // Return remaining allocated funds to user balance
  if (project.allocatedFunds > 0) {
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { balance: project.allocatedFunds },
    });
  }

  // Remove all expenses for this project
  await Expense.deleteMany({ project: project._id });

  // Remove all project_transfer / project_return transactions for this project
  await Transaction.deleteMany({ project: project._id });

  await project.deleteOne();

  res.status(200).json({ success: true, message: "Project and related data deleted" });
});

// ─────────────────────────────────────────
// GET /api/projects/:id/transactions
// All fund transfers for this project
// ─────────────────────────────────────────
export const getProjectTransactions = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, user: req.user.id });
  if (!project) throw new ApiError(404, "Project not found");

  const transactions = await Transaction.find({
    project: project._id,
    type: { $in: ["project_transfer", "project_return"] },
  }).sort({ transactionDate: -1 });

  res.status(200).json({ success: true, data: transactions });
});

// ─────────────────────────────────────────
// POST /api/projects/:id/allocate
// Transfer more funds to an existing project
// ─────────────────────────────────────────
export const allocateFunds = asyncHandler(async (req, res) => {
  const { amount, description } = req.body;
  if (!amount || amount <= 0) throw new ApiError(400, "Amount must be greater than 0");

  const [project, user] = await Promise.all([
    Project.findOne({ _id: req.params.id, user: req.user.id }),
    User.findById(req.user.id),
  ]);

  if (!project) throw new ApiError(404, "Project not found");
  if (!user) throw new ApiError(404, "User not found");
  if (user.balance < amount) throw new ApiError(400, "Insufficient balance");

  user.balance -= amount;
  project.allocatedFunds += amount;

  await Promise.all([user.save(), project.save()]);

  const transaction = await Transaction.create({
    user: req.user.id,
    type: "project_transfer",
    amount,
    description: description || `Funds allocated to project: ${project.name}`,
    project: project._id,
    balanceAfter: user.balance,
  });

  res.status(200).json({
    success: true,
    data: { project, transaction, balance: user.balance },
  });
});
