import { useEffect, useState } from "react";
import Login from "./Login";
import Projects from "./Projects";
import Tasks from "./Tasks";
import "./App.css";

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [projects, setProjects] = useState([]);

  const [dashboard, setDashboard] = useState({
    totalTasks: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
  });

  const [loading, setLoading] = useState(false);

  // Login
  const handleLogin = (loggedInUser) => {
    localStorage.setItem(
      "user",
      JSON.stringify(loggedInUser)
    );

    setUser(loggedInUser);
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
  };

  // Get dashboard
  useEffect(() => {
    if (!user) return;

    const getDashboard = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");

        const response = await fetch(
          " https://team-task-manager-p6sl.onrender.com/api/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load dashboard"
          );
        }

        setDashboard(data);
      } catch (error) {
        console.error(
          "Dashboard error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    getDashboard();
  }, [user]);

  // If not logged in
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">

      {/* Header */}
      <header className="navbar">

        <h1>Team Task Manager</h1>

        <div className="user-section">

          <span>
            {user.name} ({user.role})
          </span>

          <button onClick={handleLogout}>
            Logout
          </button>

        </div>

      </header>

      {/* Main */}
      <main className="dashboard-container">

        {/* Dashboard */}
        <h2>Dashboard</h2>

        {loading ? (
          <p>Loading dashboard...</p>
        ) : (
          <div className="dashboard">

            <div className="card">
              <h3>Total Tasks</h3>
              <p>{dashboard.totalTasks}</p>
            </div>

            <div className="card">
              <h3>Pending</h3>
              <p>{dashboard.pending}</p>
            </div>

            <div className="card">
              <h3>In Progress</h3>
              <p>{dashboard.inProgress}</p>
            </div>

            <div className="card">
              <h3>Completed</h3>
              <p>{dashboard.completed}</p>
            </div>

            <div className="card">
              <h3>Overdue</h3>
              <p>{dashboard.overdue}</p>
            </div>

          </div>
        )}

        {/* Projects */}
        <Projects
          onProjectsLoaded={setProjects}
          user={user}
        />

        {/* Tasks */}
        <Tasks
          projects={projects}
          user={user}
        />

      </main>

    </div>
  );
}

export default App;