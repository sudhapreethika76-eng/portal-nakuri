import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import "../assets/style/RecruiterCandidates.css";

function RecruiterCandidates() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [viewers, setViewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchJobCandidates();
  }, [jobId]);

  const fetchJobCandidates = async () => {
    try {
      const response = await API.get(`recruiter/jobs/${jobId}/candidates/`);
      setJob(response.data.job);
      setApplications(response.data.applications || []);
      setViewers(response.data.viewers || []);
    } catch (error) {
      console.error("API Error fetching candidates from backend:", error);
      setJob(null);
      setApplications([]);
      setViewers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId, action) => {
    try {
      await API.post(`recruiter/applications/${appId}/update/`, { action });

      if (action === "shortlist") {
        setApplications((prev) =>
          prev.map((app) => (app.id === appId ? { ...app, status: "shortlisted" } : app))
        );
        setMessage("Candidate shortlisted successfully! Notification email sent.");
      } else if (action === "reject") {
        setApplications((prev) =>
          prev.map((app) => (app.id === appId ? { ...app, status: "rejected" } : app))
        );
        setMessage("Candidate application rejected.");
      }
      setTimeout(() => setMessage(""), 4000);
    } catch (error) {
      console.error("Error updating candidate application status:", error);
      setMessage("Failed to update candidate status.");
      setTimeout(() => setMessage(""), 4000);
    }
  };

  if (loading) {
    return (
      <div className="candidates-loading" style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>
        <p>Loading candidate data...</p>
      </div>
    );
  }

  return (
    <div className="recruiter-candidates-container" style={{ padding: "30px 20px", maxWidth: "1200px", margin: "0 auto" }}>
      <button 
        onClick={() => navigate("/recruiter")} 
        className="btn btn-light btn-sm" 
        style={{ marginBottom: "20px", fontWeight: "500" }}
      >
        ← Back to Recruiter Dashboard
      </button>

      {/* Header Card */}
      {job && (
        <div style={{ background: "#ffffff", padding: "25px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "30px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <h1 style={{ color: "#0f172a", fontSize: "24px", marginBottom: "6px" }}>{job.title}</h1>
          <p style={{ color: "#475569", fontWeight: "500", margin: 0 }}>🏢 {job.company_name} | 📍 {job.location}</p>
        </div>
      )}

      {message && <div className="alert alert-success" style={{ marginBottom: "20px" }}>{message}</div>}

      {/* Applications Section */}
      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "20px", color: "#1e293b", marginBottom: "15px" }}>
          Job Applicants ({applications.length})
        </h2>

        {applications.length === 0 ? (
          <p style={{ color: "#64748b", background: "#ffffff", padding: "30px", borderRadius: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>
            No applications received for this job posting yet.
          </p>
        ) : (
          <div style={{ background: "#ffffff", borderRadius: "10px", border: "1px solid #e2e8f0", overflowX: "auto" }}>
            <table className="table table-hover mb-0" style={{ verticalAlign: "middle" }}>
              <thead className="table-light">
                <tr>
                  <th style={{ padding: "15px" }}>Candidate Name</th>
                  <th>Contact Info</th>
                  <th>Applied On</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right", paddingRight: "20px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td style={{ padding: "15px", fontWeight: "600", color: "#0f172a" }}>
                      {app.full_name || "Applicant"}
                    </td>
                    <td>
                      <div style={{ fontSize: "14px", color: "#334155" }}>{app.email}</div>
                      <div style={{ fontSize: "13px", color: "#64748b" }}>{app.phone}</div>
                    </td>
                    <td style={{ fontSize: "14px", color: "#64748b" }}>{app.applied_at}</td>
                    <td>
                      <span className={`badge ${app.status === "shortlisted" ? "bg-success" : "bg-secondary"}`}>
                        {app.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ textAlign: "right", paddingRight: "20px" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                        <Link to={`/candidate/${app.id}`} className="btn btn-outline-secondary btn-sm">
                          View Info
                        </Link>
                        {app.status !== "shortlisted" && (
                          <button 
                            onClick={() => handleUpdateStatus(app.id, "shortlist")} 
                            className="btn btn-success btn-sm"
                          >
                            ⭐ Shortlist
                          </button>
                        )}
                        <button 
                          onClick={() => handleUpdateStatus(app.id, "reject")} 
                          className="btn btn-outline-danger btn-sm"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Job Viewers Log Section */}
      <div>
        <h2 style={{ fontSize: "20px", color: "#1e293b", marginBottom: "15px" }}>
          Student Viewers Log ({viewers.length})
        </h2>

        {viewers.length === 0 ? (
          <p style={{ color: "#64748b", background: "#ffffff", padding: "30px", borderRadius: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>
            No student views recorded for this posting yet.
          </p>
        ) : (
          <div style={{ background: "#ffffff", borderRadius: "10px", border: "1px solid #e2e8f0", overflowX: "auto" }}>
            <table className="table table-hover mb-0" style={{ verticalAlign: "middle" }}>
              <thead className="table-light">
                <tr>
                  <th style={{ padding: "15px" }}>Username</th>
                  <th style={{ textAlign: "right", paddingRight: "20px" }}>Viewed At</th>
                </tr>
              </thead>
              <tbody>
                {viewers.map((view) => (
                  <tr key={view.id}>
                    <td style={{ padding: "15px", fontWeight: "600", color: "#0f172a" }}>
                      👤 {view.viewer?.username || "Student User"}
                    </td>
                    <td style={{ textAlign: "right", paddingRight: "20px", color: "#64748b", fontSize: "14px" }}>
                      {view.viewed_at}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecruiterCandidates;