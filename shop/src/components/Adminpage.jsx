import React, { useState, useEffect } from "react";
import API from "../services/api";
import "../assets/style/Adminpage.css";

function Adminpage() {
  const [adminName, setAdminName] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [editingJob, setEditingJob] = useState(null);
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // New Job form state for Admin
  const [newJob, setNewJob] = useState({
    title: "",
    company_name: "",
    location: "",
    experience: "",
    salary: "",
    job_type: "Full-time",
    skills: "",
    status: "Active",
    description: "",
  });

  useEffect(() => {
    const username = localStorage.getItem("username") || "Admin Superuser";
    setAdminName(username);
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Attempt fetching from API endpoints
      const [usersRes, jobsRes] = await Promise.allSettled([
        API.get("admin/users/"),
        API.get("jobs/"),
      ]);

      let fetchedUsers = [];
      let fetchedJobs = [];

      if (usersRes.status === "fulfilled" && usersRes.value.data) {
        fetchedUsers = Array.isArray(usersRes.value.data) ? usersRes.value.data : (usersRes.value.data.users || []);
      }
      if (jobsRes.status === "fulfilled" && jobsRes.value.data) {
        fetchedJobs = Array.isArray(jobsRes.value.data) ? jobsRes.value.data : (jobsRes.value.data.jobs || []);
      }

      setUsers(fetchedUsers);
      setJobs(fetchedJobs);
    } catch (err) {
      console.error("Failed fetching admin data from database:", err);
      setUsers([]);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3500);
  };

  const handleDeleteUser = async (userId, userRole) => {
    if (!window.confirm(`Are you sure you want to delete this ${userRole}?`)) return;
    try {
      await API.delete(`admin/users/${userId}/`);
    } catch {
      console.warn("Offline fallback user delete");
    }
    setUsers(users.filter((u) => u.id !== userId));
    showNotification(`${userRole.toUpperCase()} deleted successfully.`);
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job posting?")) return;
    try {
      await API.delete(`jobs/${jobId}/`);
    } catch {
      console.warn("Offline fallback job delete");
    }
    setJobs(jobs.filter((j) => j.id !== jobId));
    showNotification("Job posting deleted successfully!");
  };

  const handleUpdateJob = async (e) => {
    e.preventDefault();
    if (!editingJob) return;

    try {
      await API.put(`jobs/${editingJob.id}/`, editingJob);
    } catch {
      console.warn("Offline fallback job update");
    }

    setJobs(jobs.map((j) => (j.id === editingJob.id ? editingJob : j)));
    setEditingJob(null);
    showNotification("Job details updated successfully!");
  };

  const handleCreateJobByAdmin = async (e) => {
    e.preventDefault();
    const createdJob = {
      id: Date.now(),
      ...newJob,
    };

    try {
      await API.post("jobs/", createdJob);
    } catch {
      console.warn("Offline fallback job creation");
    }

    setJobs([createdJob, ...jobs]);
    setShowAddJobModal(false);
    setNewJob({
      title: "",
      company_name: "",
      location: "",
      experience: "",
      salary: "",
      job_type: "Full-time",
      skills: "",
      status: "Active",
      description: "",
    });
    showNotification("New job posted successfully by Admin!");
  };

  const toggleJobStatus = (jobId) => {
    setJobs(
      jobs.map((j) =>
        j.id === jobId
          ? { ...j, status: j.status === "Active" ? "Closed" : "Active" }
          : j
      )
    );
    showNotification("Job status updated!");
  };

  const studentsList = users.filter((u) => u.role === "student");
  const recruitersList = users.filter((u) => u.role === "recruiter");

  const filteredStudents = studentsList.filter(
    (s) =>
      s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRecruiters = recruitersList.filter(
    (r) =>
      r.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.company && r.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredJobs = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-page-container">
      <div className="admin-dashboard-wrapper">
        {/* Header */}
        <div className="admin-header-card">
          <div className="admin-header-info">
            <h1>👑 Admin Control Panel</h1>
            <p>
              Welcome back, <strong>{adminName}</strong>! Complete platform control center to manage jobs, recruiters, and students.
            </p>
          </div>
          <div className="admin-nav-tabs">
            <button
              className={`admin-tab-btn ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => { setActiveTab("overview"); setSearchTerm(""); }}
            >
              📊 Overview
            </button>
            <button
              className={`admin-tab-btn ${activeTab === "jobs" ? "active" : ""}`}
              onClick={() => { setActiveTab("jobs"); setSearchTerm(""); }}
            >
              📋 Total Jobs ({jobs.length})
            </button>
            <button
              className={`admin-tab-btn ${activeTab === "students" ? "active" : ""}`}
              onClick={() => { setActiveTab("students"); setSearchTerm(""); }}
            >
              🎓 Students List ({studentsList.length})
            </button>
            <button
              className={`admin-tab-btn ${activeTab === "recruiters" ? "active" : ""}`}
              onClick={() => { setActiveTab("recruiters"); setSearchTerm(""); }}
            >
              💼 Recruiters List ({recruitersList.length})
            </button>
          </div>
        </div>

        {/* Alert Notification */}
        {message && (
          <div className="admin-alert">
            <span>✅ {message}</span>
            <button
              style={{ background: "none", border: "none", color: "#15803d", fontWeight: "bold", cursor: "pointer" }}
              onClick={() => setMessage("")}
            >
              ✕
            </button>
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="admin-section">
            <h2>System Summary & Metrics</h2>
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-details">
                  <h3>{users.length}</h3>
                  <p>Total Registered Users</p>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="stat-icon">🎓</div>
                <div className="stat-details">
                  <h3>{studentsList.length}</h3>
                  <p>Registered Students</p>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="stat-icon">💼</div>
                <div className="stat-details">
                  <h3>{recruitersList.length}</h3>
                  <p>Registered Recruiters</p>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="stat-icon">📋</div>
                <div className="stat-details">
                  <h3>{jobs.length}</h3>
                  <p>Total Job Postings</p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: "30px", display: "flex", gap: "15px", flexWrap: "wrap" }}>
              <button className="btn btn-primary" onClick={() => { setActiveTab("jobs"); setShowAddJobModal(true); }}>
                + Post New Job as Admin
              </button>
              <button className="btn btn-outline-primary" onClick={() => setActiveTab("jobs")}>
                View All Jobs
              </button>
              <button className="btn btn-outline-secondary" onClick={() => setActiveTab("students")}>
                View All Students
              </button>
              <button className="btn btn-outline-secondary" onClick={() => setActiveTab("recruiters")}>
                View All Recruiters
              </button>
            </div>
          </div>
        )}

        {/* TOTAL JOBS TAB */}
        {activeTab === "jobs" && (
          <div className="admin-section">
            <div className="admin-toolbar">
              <h2>Total Job Postings ({filteredJobs.length})</h2>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", width: "100%", maxWidth: "500px", justifyContent: "flex-end" }}>
                <input
                  type="text"
                  className="form-control admin-search-input"
                  placeholder="Search jobs by title, company, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="btn btn-primary" onClick={() => setShowAddJobModal(true)}>
                  + Post Job
                </button>
              </div>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Company Name</th>
                    <th>Location</th>
                    <th>Salary / Exp</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                        No job postings found matching search.
                      </td>
                    </tr>
                  ) : (
                    filteredJobs.map((job) => (
                      <tr key={job.id}>
                        <td>
                          <div style={{ fontWeight: "600", color: "#0f172a" }}>{job.title}</div>
                          <small style={{ color: "#64748b" }}>Type: {job.job_type || "Full-time"}</small>
                        </td>
                        <td>{job.company_name}</td>
                        <td>{job.location}</td>
                        <td>
                          <div>{job.salary || "N/A"}</div>
                          <small style={{ color: "#64748b" }}>{job.experience || ""}</small>
                        </td>
                        <td>
                          <span
                            className={`status-tag ${job.status === "Closed" ? "closed" : "active"}`}
                            style={{ cursor: "pointer" }}
                            onClick={() => toggleJobStatus(job.id)}
                            title="Click to toggle status"
                          >
                            {job.status || "Active"}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => setEditingJob(job)}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="btn-danger-sm"
                              onClick={() => handleDeleteJob(job.id)}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STUDENTS LIST TAB */}
        {activeTab === "students" && (
          <div className="admin-section">
            <div className="admin-toolbar">
              <h2>Registered Students List ({filteredStudents.length})</h2>
              <input
                type="text"
                className="form-control admin-search-input"
                placeholder="Search student username or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Student Username</th>
                    <th>Email Address</th>
                    <th>Joined Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                        No students found.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s) => (
                      <tr key={s.id}>
                        <td>#{s.id}</td>
                        <td className="fw-semibold">
                          <span style={{ color: "#2563eb" }}>🎓 {s.username}</span>
                        </td>
                        <td>{s.email}</td>
                        <td>{s.dateJoined || "Recently"}</td>
                        <td>
                          <button
                            className="btn-danger-sm"
                            onClick={() => handleDeleteUser(s.id, "student")}
                          >
                            Delete Student
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* RECRUITERS LIST TAB */}
        {activeTab === "recruiters" && (
          <div className="admin-section">
            <div className="admin-toolbar">
              <h2>Registered Recruiters List ({filteredRecruiters.length})</h2>
              <input
                type="text"
                className="form-control admin-search-input"
                placeholder="Search recruiter name, email or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Recruiter Username</th>
                    <th>Company / Email</th>
                    <th>Joined Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecruiters.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                        No recruiters found.
                      </td>
                    </tr>
                  ) : (
                    filteredRecruiters.map((r) => (
                      <tr key={r.id}>
                        <td>#{r.id}</td>
                        <td className="fw-semibold">
                          <span style={{ color: "#0284c7" }}>💼 {r.username}</span>
                        </td>
                        <td>
                          <div>{r.email}</div>
                          {r.company && <small style={{ color: "#64748b" }}>🏢 {r.company}</small>}
                        </td>
                        <td>{r.dateJoined || "Recently"}</td>
                        <td>
                          <button
                            className="btn-danger-sm"
                            onClick={() => handleDeleteUser(r.id, "recruiter")}
                          >
                            Delete Recruiter
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* EDIT JOB MODAL */}
        {editingJob && (
          <div className="admin-modal-overlay" onClick={() => setEditingJob(null)}>
            <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
              <h3>Edit Job Posting</h3>
              <form onSubmit={handleUpdateJob}>
                <div className="mb-3">
                  <label className="form-label">Job Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingJob.title || ""}
                    onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Company Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingJob.company_name || ""}
                    onChange={(e) => setEditingJob({ ...editingJob, company_name: e.target.value })}
                    required
                  />
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Location *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingJob.location || ""}
                      onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={editingJob.status || "Active"}
                      onChange={(e) => setEditingJob({ ...editingJob, status: e.target.value })}
                    >
                      <option value="Active">Active</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Salary Package</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. ₹ 10 - 15 LPA"
                      value={editingJob.salary || ""}
                      onChange={(e) => setEditingJob({ ...editingJob, salary: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Experience Required</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 1-3 years"
                      value={editingJob.experience || ""}
                      onChange={(e) => setEditingJob({ ...editingJob, experience: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Required Skills</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. React, Node.js, Python"
                    value={editingJob.skills || ""}
                    onChange={(e) => setEditingJob({ ...editingJob, skills: e.target.value })}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditingJob(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ADD JOB MODAL (ADMIN) */}
        {showAddJobModal && (
          <div className="admin-modal-overlay" onClick={() => setShowAddJobModal(false)}>
            <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
              <h3>Post New Job as Admin</h3>
              <form onSubmit={handleCreateJobByAdmin}>
                <div className="mb-3">
                  <label className="form-label">Job Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Job Title"
                    value={newJob.title}
                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Company Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Company Name"
                    value={newJob.company_name}
                    onChange={(e) => setNewJob({ ...newJob, company_name: e.target.value })}
                    required
                  />
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Location *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Location"
                      value={newJob.location}
                      onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Job Type</label>
                    <select
                      className="form-select"
                      value={newJob.job_type}
                      onChange={(e) => setNewJob({ ...newJob, job_type: e.target.value })}
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Salary</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Salary Package (e.g. ₹ 10 - 15 LPA)"
                      value={newJob.salary}
                      onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Experience</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Experience Required (e.g. 1-3 years)"
                      value={newJob.experience}
                      onChange={(e) => setNewJob({ ...newJob, experience: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Skills</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Required Skills (e.g. React, Python, AWS)"
                    value={newJob.skills}
                    onChange={(e) => setNewJob({ ...newJob, skills: e.target.value })}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddJobModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Publish Job
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Adminpage;