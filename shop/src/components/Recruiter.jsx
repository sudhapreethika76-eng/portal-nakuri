import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import "../assets/style/Recruiter.css";

function Recruiter() {
  const [username, setUsername] = useState("");
  const [postedJobs, setPostedJobs] = useState([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [message, setMessage] = useState("");
  const [modalError, setModalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalContainerRef = React.useRef(null);

  // New Job form state
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [salary, setSalary] = useState("");
  const [jobType, setJobType] = useState("Full-time");
  const [skills, setSkills] = useState("");
  const [qualification, setQualification] = useState("");
  const [vacancies, setVacancies] = useState(1);
  const [description, setDescription] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("username") || "Recruiter";
    setUsername(savedUser);
    fetchRecruiterDashboard();
  }, []);

  const fetchRecruiterDashboard = async () => {
    try {
      const response = await API.get("recruiter/dashboard/");
      if (response.data && response.data.jobs) {
        setPostedJobs(response.data.jobs);
      } else {
        setPostedJobs([]);
      }
    } catch (error) {
      console.error("Error fetching recruiter dashboard from database:", error);
      setPostedJobs([]); // No mock data fallback
    }
  };

  const showNotification = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3500);
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setModalError("");

    if (!jobTitle.trim()) {
      setModalError("Please enter a Job Title at the top of the form.");
      if (modalContainerRef.current) modalContainerRef.current.scrollTop = 0;
      return;
    }
    if (!companyName.trim()) {
      setModalError("Please enter a Company Name.");
      if (modalContainerRef.current) modalContainerRef.current.scrollTop = 0;
      return;
    }
    if (!location.trim()) {
      setModalError("Please enter a Location.");
      if (modalContainerRef.current) modalContainerRef.current.scrollTop = 0;
      return;
    }
    if (!skills.trim()) {
      setModalError("Please enter Required Skills.");
      if (modalContainerRef.current) modalContainerRef.current.scrollTop = 0;
      return;
    }
    if (!description.trim()) {
      setModalError("Please enter a Job Description.");
      return;
    }

    setIsSubmitting(true);
    const newJobData = {
      title: jobTitle,
      company_name: companyName,
      location,
      experience,
      salary,
      job_type: jobType,
      skills,
      qualification,
      vacancies: parseInt(vacancies, 10) || 1,
      description,
    };

    try {
      let response;
      try {
        response = await API.post("recruiter/dashboard/", newJobData);
      } catch (err) {
        response = await API.post("jobs/", newJobData);
      }

      setShowPostModal(false);
      resetForm();
      showNotification("Job opening published successfully!");
      fetchRecruiterDashboard();
    } catch (error) {
      console.error("API Error publishing job:", error);
      const errorDetail = error.response?.data?.error || error.response?.data?.detail || "Failed to publish job to backend server. Please check your connection and try again.";
      setModalError(errorDetail);
      if (modalContainerRef.current) modalContainerRef.current.scrollTop = 0;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateJob = async (e) => {
    e.preventDefault();
    if (!editingJob) return;

    try {
      await API.put(`jobs/${editingJob.id}/`, editingJob);
      setPostedJobs(postedJobs.map((j) => (j.id === editingJob.id ? editingJob : j)));
      setEditingJob(null);
      showNotification("Job posting updated successfully!");
      fetchRecruiterDashboard();
    } catch (error) {
      console.error("Error updating job posting:", error);
      showNotification("Failed to update job posting.");
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job opening?")) return;
    try {
      await API.delete(`jobs/${jobId}/`);
      setPostedJobs(postedJobs.filter((j) => j.id !== jobId));
      showNotification("Job posting deleted.");
    } catch (error) {
      console.error("Error deleting job posting:", error);
      showNotification("Failed to delete job posting.");
    }
  };

  const toggleStatus = (jobId) => {
    setPostedJobs(
      postedJobs.map((j) =>
        j.id === jobId ? { ...j, status: j.status === "Closed" ? "Active" : "Closed" } : j
      )
    );
    showNotification("Job status updated!");
  };

  const resetForm = () => {
    setJobTitle("");
    setCompanyName("");
    setLocation("");
    setExperience("");
    setSalary("");
    setJobType("Full-time");
    setSkills("");
    setQualification("");
    setVacancies(1);
    setDescription("");
  };

  return (
    <div className="recruiter-page" style={{ padding: "30px 20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div
        className="recruiter-header-card"
        style={{
          background: "#ffffff",
          padding: "30px",
          borderRadius: "14px",
          border: "1px solid #e2e8f0",
          marginBottom: "25px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
        }}
      >
        <div>
          <h1 style={{ color: "#0f172a", fontSize: "28px", fontWeight: "700", marginBottom: "6px" }}>
            💼 Recruiter Dashboard
          </h1>
          <p style={{ color: "#64748b", fontSize: "15px", margin: 0 }}>
            Welcome back, <strong>{username}</strong>! Manage job openings and review candidate applications.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowPostModal(true)}
          style={{ padding: "12px 24px", fontWeight: "600", borderRadius: "8px" }}
        >
          + Post New Job
        </button>
      </div>

      {message && (
        <div
          className="alert alert-success"
          style={{
            borderRadius: "10px",
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>✅ {message}</span>
          <button style={{ background: "none", border: "none", color: "#15803d", fontWeight: "bold" }} onClick={() => setMessage("")}>
            ✕
          </button>
        </div>
      )}

      {/* Stats Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "25px" }}>
        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ color: "#64748b", fontSize: "14px", fontWeight: "500" }}>Total Jobs Posted</div>
          <div style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", marginTop: "4px" }}>{postedJobs.length}</div>
        </div>
        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ color: "#64748b", fontSize: "14px", fontWeight: "500" }}>Active Openings</div>
          <div style={{ fontSize: "28px", fontWeight: "800", color: "#16a34a", marginTop: "4px" }}>
            {postedJobs.filter((j) => (j.status || "Active") === "Active").length}
          </div>
        </div>
        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ color: "#64748b", fontSize: "14px", fontWeight: "500" }}>Total Applications Received</div>
          <div style={{ fontSize: "28px", fontWeight: "800", color: "#2563eb", marginTop: "4px" }}>
            {postedJobs.reduce((acc, curr) => acc + (curr.applicants_count || 0), 0)}
          </div>
        </div>
      </div>

      {/* Posted Jobs Section */}
      <div className="recruiter-section">
        <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#1e293b", marginBottom: "20px" }}>
          Your Posted Openings ({postedJobs.length})
        </h2>

        {postedJobs.length === 0 ? (
          <div style={{ background: "#ffffff", padding: "40px", textAlign: "center", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <p style={{ color: "#64748b", fontSize: "16px" }}>You have not posted any job openings yet.</p>
            <button className="btn btn-primary" onClick={() => setShowPostModal(true)} style={{ marginTop: "10px" }}>
              + Create Your First Job
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "20px" }}>
            {postedJobs.map((job) => (
              <div
                key={job.id}
                style={{
                  background: "#ffffff",
                  padding: "24px",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a", marginBottom: "4px" }}>
                      {job.title}
                    </h3>
                    <p style={{ color: "#475569", fontWeight: "500", margin: 0 }}>🏢 {job.company_name}</p>
                  </div>
                  <span
                    className={`badge ${job.status === "Closed" ? "bg-danger" : "bg-success"}`}
                    style={{ cursor: "pointer", padding: "8px 12px", fontSize: "12px" }}
                    onClick={() => toggleStatus(job.id)}
                    title="Click to toggle Active/Closed"
                  >
                    {job.status || "Active"}
                  </span>
                </div>

                <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", color: "#64748b", fontSize: "14px", marginBottom: "15px" }}>
                  <span>📍 {job.location}</span>
                  <span>⏱️ {job.job_type || "Full-time"}</span>
                  {job.salary && <span>💰 {job.salary}</span>}
                  {job.experience && <span>🎓 {job.experience}</span>}
                </div>

                {job.skills && (
                  <div style={{ marginBottom: "16px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {job.skills.split(",").map((s, idx) => (
                      <span key={idx} style={{ background: "#eff6ff", color: "#1d4ed8", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "500" }}>
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: "1px solid #f1f5f9",
                    paddingTop: "15px",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>
                    👁️ <strong>{job.views_count || 0}</strong> Student View(s) &nbsp;•&nbsp; 👥 <strong>{job.applicants_count || 0}</strong> Candidate(s) Applied
                  </span>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <Link to={`/recruiter/job/${job.id}/candidates`} className="btn btn-outline-primary btn-sm" style={{ fontWeight: "600" }}>
                      View Applications
                    </Link>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditingJob(job)}>
                      Edit
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteJob(job.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* POST NEW JOB MODAL */}
      {showPostModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1100,
            padding: "20px",
          }}
          onClick={() => { setShowPostModal(false); setModalError(""); }}
        >
          <div
            ref={modalContainerRef}
            style={{
              background: "#ffffff",
              padding: "30px",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "640px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "20px" }}>Post a New Job Opening</h3>
            
            {modalError && (
              <div style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", fontWeight: "600" }}>
                ⚠️ {modalError}
              </div>
            )}

            <form onSubmit={handleCreateJob}>
              <div className="mb-3">
                <label className="form-label">Job Title *</label>
                <input type="text" className="form-control" placeholder="Enter Job Title" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Company Name *</label>
                <input type="text" className="form-control" placeholder="Enter Company Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Location *</label>
                  <input type="text" className="form-control" placeholder="Enter Location" value={location} onChange={(e) => setLocation(e.target.value)} required />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Job Type *</label>
                  <select className="form-select" value={jobType} onChange={(e) => setJobType(e.target.value)}>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
              </div>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Salary Package</label>
                  <input type="text" className="form-control" placeholder="e.g. ₹ 10 - 15 LPA" value={salary} onChange={(e) => setSalary(e.target.value)} />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Required Experience</label>
                  <input type="text" className="form-control" placeholder="e.g. 1-3 years" value={experience} onChange={(e) => setExperience(e.target.value)} />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">No. of Vacancies</label>
                  <input type="number" min="1" className="form-control" placeholder="e.g. 1" value={vacancies} onChange={(e) => setVacancies(e.target.value)} />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Required Skills *</label>
                <input type="text" className="form-control" placeholder="Enter Required Skills (e.g. React, JavaScript, HTML)" value={skills} onChange={(e) => setSkills(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Job Description *</label>
                <textarea className="form-control" rows="3" placeholder="Enter Job Description and Responsibilities..." value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowPostModal(false); setModalError(""); }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Publishing..." : "Publish Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT JOB MODAL */}
      {editingJob && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1100,
            padding: "20px",
          }}
          onClick={() => setEditingJob(null)}
        >
          <div
            style={{
              background: "#ffffff",
              padding: "30px",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "20px" }}>Edit Job Posting</h3>
            <form onSubmit={handleUpdateJob}>
              <div className="mb-3">
                <label className="form-label">Job Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={editingJob.title || ""}
                  onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Company Name</label>
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
                  <label className="form-label">Location</label>
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
                  <label className="form-label">Skills</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingJob.skills || ""}
                    onChange={(e) => setEditingJob({ ...editingJob, skills: e.target.value })}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">No. of Vacancies</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={editingJob.vacancies || 1}
                    onChange={(e) => setEditingJob({ ...editingJob, vacancies: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingJob(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Recruiter;