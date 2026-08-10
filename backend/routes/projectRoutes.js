const express = require("express");

const {
  createProject,
  getProjects,
  addMember,
} = require("../controllers/projectController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Admin can create a project
router.post("/", protect, adminOnly, createProject);

// Logged-in users can view their projects
router.get("/", protect, getProjects);

router.post("/:id/members", protect, adminOnly, addMember);

module.exports = router;