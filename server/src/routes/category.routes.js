import express from "express";
import {
  getCategories,
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/categories.controllers.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.route("/").get(getCategories).post(createCategory);
router.route("/:id").get(getCategoryById).patch(updateCategory).delete(deleteCategory);

export default router;
