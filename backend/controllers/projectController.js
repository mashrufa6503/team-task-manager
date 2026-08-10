const Project = require("../models/Project");

// Create a project
const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Project name is required",
      });
    }

    const project = await Project.create({
      name,
      description,
      owner: req.user.id,
      members: [req.user.id],
    });

    res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create project",
      error: error.message,
    });
  }
};

// Get projects for logged-in user
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      members: req.user.id,
    })
      .populate("owner", "name email role")
      .populate("members", "name email role");

    res.json({
      projects,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get projects",
      error: error.message,
    });
  }
};

// Add a member to a project
const addMember = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Only project owner can add members
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Only the project owner can add members",
      });
    }

    // Check if user is already a member
    if (project.members.some((member) => member.toString() === userId)) {
      return res.status(400).json({
        message: "User is already a member of this project",
      });
    }

    project.members.push(userId);

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate("owner", "name email role")
      .populate("members", "name email role");

    res.json({
      message: "Member added successfully",
      project: updatedProject,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add member",
      error: error.message,
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  addMember,
};
