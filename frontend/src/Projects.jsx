import { useEffect, useState } from "react";

function Projects({ onProjectsLoaded, user }) {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const [memberIds, setMemberIds] = useState({});

  const token = localStorage.getItem("token");

  // Get projects
  const getProjects = async () => {
    try {
      const response = await fetch(
        " https://team-task-manager-p6sl.onrender.com/api/projects",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load projects"
        );
      }

      const projectList = data.projects || [];

      setProjects(projectList);

      if (onProjectsLoaded) {
        onProjectsLoaded(projectList);
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  useEffect(() => {
    getProjects();
  }, []);

  // Create project
  const createProject = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Project name is required");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        " https://team-task-manager-p6sl.onrender.com/api/projects",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            description,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create project"
        );
      }

      alert("Project created successfully!");

      setName("");
      setDescription("");

      getProjects();
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Add member
  const addMember = async (projectId) => {
    const userId = memberIds[projectId];

    if (!userId) {
      alert("Enter a User ID");
      return;
    }

    try {
      const response = await fetch(
        ` https://team-task-manager-p6sl.onrender.com/api/projects/${projectId}/members`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to add member"
        );
      }

      alert("Member added successfully!");

      setMemberIds({
        ...memberIds,
        [projectId]: "",
      });

      getProjects();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <div className="projects-page">

      <h2>Projects</h2>

      {/* Create Project */}
      {user?.role === "Admin" && (
        <form onSubmit={createProject}>

          <input
            type="text"
            placeholder="Project name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />

          <textarea
            placeholder="Project description"
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
          />

          <button type="submit" disabled={loading}>
            {loading
              ? "Creating..."
              : "Create Project"}
          </button>

        </form>
      )}

      <h3>Your Projects</h3>

      {projects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        <div>
          {projects.map((project) => (
            <div
              className="project-card"
              key={project._id}
            >

              <h3>{project.name}</h3>

              <p>
                {project.description ||
                  "No description"}
              </p>

              <p>
                <strong>Owner:</strong>{" "}
                {project.owner?.name ||
                  "Unknown"}
              </p>

              <p>
                <strong>Members:</strong>{" "}
                {project.members?.length || 0}
              </p>

              {/* Member list */}
              {project.members?.length > 0 && (
                <div>
                  <strong>Team:</strong>

                  <ul>
                    {project.members.map(
                      (member) => (
                        <li key={member._id}>
                          {member.name} (
                          {member.role})
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {/* Add member - Admin only */}
              {user?.role === "Admin" && (
                <div className="add-member">

                  <h4>Add Team Member</h4>

                  <input
                    type="text"
                    placeholder="Enter User ID"
                    value={
                      memberIds[project._id] || ""
                    }
                    onChange={(e) =>
                      setMemberIds({
                        ...memberIds,
                        [project._id]:
                          e.target.value,
                      })
                    }
                  />

                  <button
                    onClick={() =>
                      addMember(project._id)
                    }
                  >
                    Add Member
                  </button>

                </div>
              )}

            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default Projects;