import mongoose from "mongoose";
import Expense from "../models/expense.model.js";
import Project from "../models/project.model.js";
import Category from "../models/category.model.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

// ─────────────────────────────────────────
// GET /api/expenses
// Query: ?projectId=&categoryId=&startDate=&endDate=&page=&limit=
// ─────────────────────────────────────────
export const getExpenses = asyncHandler(async (req, res) => {
  const { projectId, categoryId, startDate, endDate, page = 1, limit = 50 } = req.query;

  const filter = { user: req.user.id };
  if (projectId) filter.project = projectId;
  if (categoryId) filter.category = categoryId;
  if (startDate || endDate) {
    filter.expenseDate = {};
    if (startDate) filter.expenseDate.$gte = new Date(startDate);
    if (endDate) filter.expenseDate.$lte = new Date(endDate);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [expenses, total] = await Promise.all([
    Expense.find(filter)
      .populate("category", "name color icon")
      .populate("project", "name")
      .sort({ expenseDate: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Expense.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: expenses,
    pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
  });
});

// ─────────────────────────────────────────
// GET /api/expenses/:id
// ─────────────────────────────────────────
export const getExpenseById = asyncHandler(async (req, res) => {
  const expense = await Expense.findOne({ _id: req.params.id, user: req.user.id })
    .populate("category", "name color icon")
    .populate("project", "name");
  if (!expense) throw new ApiError(404, "Expense not found");
  res.status(200).json({ success: true, data: expense });
});

// ─────────────────────────────────────────
// POST /api/expenses
// Adds expense and increments project.spentAmount
// ─────────────────────────────────────────
export const createExpense = asyncHandler(async (req, res) => {
  const { projectId, categoryId, amount, description, vendor, expenseDate } = req.body;

  if (!projectId || !categoryId || !amount) {
    throw new ApiError(400, "projectId, categoryId and amount are required");
  }
  if (amount <= 0) throw new ApiError(400, "Amount must be greater than 0");

  const [project, category] = await Promise.all([
    Project.findOne({ _id: projectId, user: req.user.id }),
    Category.findOne({ _id: categoryId, user: req.user.id }),
  ]);

  if (!project) throw new ApiError(404, "Project not found");
  if (!category) throw new ApiError(404, "Category not found");

  const expense = await Expense.create({
    user: req.user.id,
    project: projectId,
    category: categoryId,
    amount,
    description,
    vendor,
    expenseDate: expenseDate || Date.now(),
  });

  // Update project spent amount
  project.spentAmount += amount;
  await project.save();

  const populated = await expense.populate([
    { path: "category", select: "name color icon" },
    { path: "project", select: "name" },
  ]);

  res.status(201).json({ success: true, data: populated });
});

// ─────────────────────────────────────────
// PATCH /api/expenses/:id
// Updates expense and reconciles project spentAmount delta
// ─────────────────────────────────────────
export const updateExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOne({ _id: req.params.id, user: req.user.id });
  if (!expense) throw new ApiError(404, "Expense not found");

  const oldAmount = expense.amount;
  const { amount, description, vendor, categoryId, expenseDate } = req.body;

  if (amount !== undefined) expense.amount = amount;
  if (description !== undefined) expense.description = description;
  if (vendor !== undefined) expense.vendor = vendor;
  if (categoryId !== undefined) expense.category = categoryId;
  if (expenseDate !== undefined) expense.expenseDate = expenseDate;

  await expense.save();

  // Reconcile project spentAmount
  if (amount !== undefined && amount !== oldAmount) {
    const delta = amount - oldAmount;
    await Project.findByIdAndUpdate(expense.project, { $inc: { spentAmount: delta } });
  }

  const populated = await expense.populate([
    { path: "category", select: "name color icon" },
    { path: "project", select: "name" },
  ]);

  res.status(200).json({ success: true, data: populated });
});

// ─────────────────────────────────────────
// DELETE /api/expenses/:id
// Decrements project.spentAmount
// ─────────────────────────────────────────
export const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOne({ _id: req.params.id, user: req.user.id });
  if (!expense) throw new ApiError(404, "Expense not found");

  await Project.findByIdAndUpdate(expense.project, {
    $inc: { spentAmount: -expense.amount },
  });

  await expense.deleteOne();

  res.status(200).json({ success: true, message: "Expense deleted" });
});

// ─────────────────────────────────────────
// GET /api/expenses/category-detail
// All expenses for a specific project + category (for the detail page)
// ─────────────────────────────────────────
export const getCategoryDetail = asyncHandler(async (req, res) => {
  const { projectId, categoryId } = req.query;

  if (!projectId || !categoryId) {
    throw new ApiError(400, "projectId and categoryId are required");
  }

  const [project, category, expenses, trend] = await Promise.all([
    Project.findOne({ _id: projectId, user: req.user.id }),
    Category.findOne({ _id: categoryId, user: req.user.id }),
    Expense.find({ project: projectId, category: categoryId, user: req.user.id })
      .sort({ expenseDate: -1 }),
    // Weekly spend trend for this category within this project
    Expense.aggregate([
      { $match: { project: new mongoose.Types.ObjectId(projectId), category: new mongoose.Types.ObjectId(categoryId) } },
      {
        $group: {
          _id: {
            year: { $year: "$expenseDate" },
            month: { $month: "$expenseDate" },
            day: { $dayOfMonth: "$expenseDate" },
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]),
  ]);

  if (!project) throw new ApiError(404, "Project not found");
  if (!category) throw new ApiError(404, "Category not found");

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  res.status(200).json({
    success: true,
    data: {
      project,
      category,
      expenses,
      total,
      trend,
    },
  });
});