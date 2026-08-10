const Task = require("../models/Task");
const Project = require("../models/Project");

// Create a task
const createTask = async (req, res) => {
  try {
    const { title, description, project, assignedTo, dueDate } = req.body;

    if (!title || !project || !assignedTo || !dueDate) {
      return res.status(400).json({
        message: "Title, project, assignedTo and dueDate are required",
      });
    }

    // Check that the project exists
    const existingProject = await Project.findById(project);

    if (!existingProject) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Only project owner can create tasks
    if (existingProject.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Only the project owner can create tasks",
      });
    }

    // Check that assigned user belongs to project
    const isMember = existingProject.members.some(
      (member) => member.toString() === assignedTo
    );

    if (!isMember) {
      return res.status(400).json({
        message: "Assigned user is not a member of this project",
      });
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo,
      dueDate,
    });

    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email role")
      .populate("project", "name");

    res.status(201).json({
      message: "Task created successfully",
      task: populatedTask,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create task",
      error: error.message,
    });
  }
};

// Get tasks
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.user.id,
    })
      .populate("assignedTo", "name email role")
      .populate("project", "name");

    res.json({
      tasks,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get tasks",
      error: error.message,
    });
  }
};

// Update task status
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "In Progress",
      "Completed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Only the assigned user can update the task
    if (task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can only update tasks assigned to you",
      });
    }

    task.status = status;

    await task.save();

    res.json({
      message: "Task status updated successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update task",
      error: error.message,
    });
  }
};

// Get overdue tasks
const getOverdueTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.user.id,
      status: { $ne: "Completed" },
      dueDate: { $lt: new Date() },
    })
      .populate("assignedTo", "name email role")
      .populate("project", "name");

    res.json({
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get overdue tasks",
      error: error.message,
    });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTaskStatus,
  getOverdueTasks,
};