const Task = require("../models/Task");

const getDashboard = async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.user.id,
    });

    const totalTasks = tasks.length;

    const pending = tasks.filter(
      (task) => task.status === "Pending"
    ).length;

    const inProgress = tasks.filter(
      (task) => task.status === "In Progress"
    ).length;

    const completed = tasks.filter(
      (task) => task.status === "Completed"
    ).length;

    const overdue = tasks.filter(
      (task) =>
        task.status !== "Completed" &&
        new Date(task.dueDate) < new Date()
    ).length;

    res.json({
      totalTasks,
      pending,
      inProgress,
      completed,
      overdue,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load dashboard",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboard,
};