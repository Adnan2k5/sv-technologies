import express from "express";
import {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectTransactions,
  allocateFunds,
} from "../controllers/project.controllers.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.route("/").get(getProjects).post(createProject);
router.route("/:id").get(getProjectById).patch(updateProject).delete(deleteProject);
router.get("/:id/transactions", getProjectTransactions);
router.post("/:id/allocate", allocateFunds);

export default router;
