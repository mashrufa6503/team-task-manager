import { useEffect, useState } from "react";

function Tasks({ projects, user }) {
  const [tasks, setTasks] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [project, setProject] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // Get user's tasks
  const getTasks = async () => {
    try {
      const response = await fetch(
        " https://team-task-manager-p6sl.onrender.com/api/tasks",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load tasks");
      }

      setTasks(data.tasks || []);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  useEffect(() => {
    getTasks();
  }, []);

  // Create task
  const createTask = async (e) => {
    e.preventDefault();

    if (!title || !project || !assignedTo || !dueDate) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        " https://team-task-manager-p6sl.onrender.com/api/tasks",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            description,
            project,
            assignedTo,
            dueDate,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create task");
      }

      alert("Task created successfully!");

      setTitle("");
      setDescription("");
      setProject("");
      setAssignedTo("");
      setDueDate("");

      getTasks();
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update task status
  const updateStatus = async (taskId, status) => {
    try {
      const response = await fetch(
        ` https://team-task-manager-p6sl.onrender.com/api/tasks/${taskId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      getTasks();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <div className="tasks-page">

      <h2>Tasks</h2>

      {/* Create Task */}
      {user.role === "Admin" && (
        <div className="create-task">

          <h3>Create Task</h3>

          <form onSubmit={createTask}>

            <input
              type="text"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              placeholder="Task description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <select
              value={project}
              onChange={(e) => {
                setProject(e.target.value);
                setAssignedTo("");
              }}
            >
              <option value="">
                Select Project
              </option>

              {projects.map((item) => (
                <option
                  key={item._id}
                  value={item._id}
                >
                  {item.name}
                </option>
              ))}
            </select>

            <select
              value={assignedTo}
              onChange={(e) =>
                setAssignedTo(e.target.value)
              }
              disabled={!project}
            >
              <option value="">
                Select Member
              </option>

              {projects
                .find((item) => item._id === project)
                ?.members?.map((member) => (
                  <option
                    key={member._id}
                    value={member._id}
                  >
                    {member.name}
                  </option>
                ))}
            </select>

            <input
              type="date"
              value={dueDate}
              onChange={(e) =>
                setDueDate(e.target.value)
              }
            />

            <button type="submit" disabled={loading}>
              {loading
                ? "Creating..."
                : "Create Task"}
            </button>

          </form>
        </div>
      )}

      {/* Tasks list */}
      <h3>Your Tasks</h3>

      {tasks.length === 0 ? (
        <p>No tasks found.</p>
      ) : (
        <div className="task-list">

          {tasks.map((task) => (
            <div
              className="task-card"
              key={task._id}
            >

              <h3>{task.title}</h3>

              <p>
                {task.description ||
                  "No description"}
              </p>

              <p>
                <strong>Project:</strong>{" "}
                {task.project?.name || "Unknown"}
              </p>

              <p>
                <strong>Assigned To:</strong>{" "}
                {task.assignedTo?.name ||
                  "Unknown"}
              </p>

              <p>
                <strong>Due Date:</strong>{" "}
                {new Date(
                  task.dueDate
                ).toLocaleDateString()}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {task.status}
              </p>

              <select
                value={task.status}
                onChange={(e) =>
                  updateStatus(
                    task._id,
                    e.target.value
                  )
                }
              >
                <option value="Pending">
                  Pending
                </option>

                <option value="In Progress">
                  In Progress
                </option>

                <option value="Completed">
                  Completed
                </option>
              </select>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default Tasks;