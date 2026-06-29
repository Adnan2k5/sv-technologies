import Category from "../models/category.model.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

// Default categories seeded for new users
export const DEFAULT_CATEGORIES = [
  { name: "Material", color: "#3B82F6", icon: "package" },
  { name: "Labour", color: "#10B981", icon: "users" },
  { name: "Equipment", color: "#F59E0B", icon: "tool" },
  { name: "Transport", color: "#8B5CF6", icon: "truck" },
  { name: "Miscellaneous", color: "#6B7280", icon: "more-horizontal" },
];
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({
    user: req.user.id,
    isDeleted: false,
  }).sort({ isDefault: -1, name: 1 });
  if (categories.length === 0) {
    const seeded = await Category.insertMany(
      DEFAULT_CATEGORIES.map((c) => ({ ...c, user: req.user.id, isDefault: true }))
    );
    return res.status(200).json({ success: true, data: seeded });
  }

  res.status(200).json({ success: true, data: categories });
});
export const createCategory = asyncHandler(async (req, res) => {
  const { name, color, icon } = req.body;
  if (!name) throw new ApiError(400, "Category name is required");

  const existing = await Category.findOne({ user: req.user.id, name, isDeleted: false });
  if (existing) throw new ApiError(409, "A category with this name already exists");

  const category = await Category.create({
    user: req.user.id,
    name,
    color: color || "#6B7280",
    icon: icon || "tag",
  });

  res.status(201).json({ success: true, data: category });
});

export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findOne({
    _id: req.params.id,
    user: req.user.id,
    isDeleted: false,
  });
  if (!category) throw new ApiError(404, "Category not found");
  res.status(200).json({ success: true, data: category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { name, color, icon } = req.body;
  const category = await Category.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id, isDeleted: false },
    { name, color, icon },
    { new: true, runValidators: true }
  );
  if (!category) throw new ApiError(404, "Category not found");
  res.status(200).json({ success: true, data: category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );
  if (!category) throw new ApiError(404, "Category not found");
  res.status(200).json({ success: true, message: "Category deleted" });
});
