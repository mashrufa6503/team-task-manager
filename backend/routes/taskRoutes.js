const express = require("express");

const {
  createTask,
  getTasks,
  updateTaskStatus,
  getOverdueTasks,
} = require("../controllers/taskController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Admin creates tasks
router.post("/", protect, adminOnly, createTask);

// Logged-in user gets their tasks
router.get("/", protect, getTasks);

// Assigned user updates task status
router.patch("/:id/status", protect, updateTaskStatus);

// Logged-in user gets overdue tasks
router.get("/overdue", protect, getOverdueTasks);

module.exports = router;