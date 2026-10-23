import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import "../assets/style/JobDetail.css";

function JobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await API.get(`jobs/${jobId}/`);
        setJob(response.data.job || response.data);
        setHasApplied(response.data.has_applied || false);
      } catch (error) {
        console.error("Error fetching job details from database:", error);
        setJob(null); // No mock data fallback
        setHasApplied(false);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  if (loading) {
    return (
      <div className="job-detail-loading" style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>
        <p>Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="job-detail-error" style={{ textAlign: "center", padding: "60px" }}>
        <p style={{ color: "#ef4444", marginBottom: "15px" }}>Job posting not found.</p>
        <button onClick={() => navigate("/home")} className="btn btn-secondary">
          Back to Jobs List
        </button>
      </div>
    );
  }

  return (
    <div className="job-detail-page-container" style={{ padding: "40px 20px", maxWidth: "1000px", margin: "0 auto" }}>
      <button 
        onClick={() => navigate(-1)} 
        className="btn btn-light btn-sm" 
        style={{ marginBottom: "20px", fontWeight: "500" }}
      >
        ← Back
      </button>

      <div className="job-detail-card" style={{ background: "#ffffff", padding: "35px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        {/* Header Section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #f1f5f9", paddingBottom: "25px", marginBottom: "25px", flexWrap: "wrap", gap: "15px" }}>
          <div>
            <h1 style={{ color: "#0f172a", fontSize: "26px", marginBottom: "8px" }}>{job.title}</h1>
            <p style={{ color: "#475569", fontSize: "18px", fontWeight: "600", margin: 0 }}>🏢 {job.company_name}</p>
          </div>
          <div>
            {hasApplied ? (
              <span className="badge bg-success" style={{ padding: "8px 14px", fontSize: "14px" }}>✓ Applied Successfully</span>
            ) : (
              <Link to={`/apply/${job.id}`} className="btn btn-primary" style={{ padding: "10px 24px", fontWeight: "600" }}>
                Apply for this Job
              </Link>
            )}
          </div>
        </div>

        {message && <div className="alert alert-info" style={{ marginBottom: "20px" }}>{message}</div>}

        {/* Metadata Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "20px", background: "#f8fafc", padding: "20px", borderRadius: "8px", marginBottom: "30px" }}>
          <div>
            <span style={{ display: "block", fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>Location</span>
            <strong style={{ color: "#1e293b", fontSize: "15px" }}>📍 {job.location}</strong>
          </div>
          <div>
            <span style={{ display: "block", fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>Experience</span>
            <strong style={{ color: "#1e293b", fontSize: "15px" }}>⏱️ {job.experience || "Not specified"}</strong>
          </div>
          <div>
            <span style={{ display: "block", fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>Salary</span>
            <strong style={{ color: "#1e293b", fontSize: "15px" }}>💰 {job.salary || "Not specified"}</strong>
          </div>
          <div>
            <span style={{ display: "block", fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>Job Type</span>
            <strong style={{ color: "#1e293b", fontSize: "15px" }}>💼 {job.job_type || "Full-time"}</strong>
          </div>
          <div>
            <span style={{ display: "block", fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>Openings</span>
            <strong style={{ color: "#1e293b", fontSize: "15px" }}>👥 {job.vacancies || 1} Vacancy(ies)</strong>
          </div>
        </div>

        {/* Required Skills */}
        {job.skills && (
          <div style={{ marginBottom: "25px" }}>
            <h3 style={{ fontSize: "18px", color: "#1e293b", marginBottom: "12px" }}>Required Skills</h3>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {job.skills.split(",").map((skill, index) => (
                <span
                  key={index}
                  style={{
                    background: "#f1f5f9",
                    color: "#475569",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: "500",
                    border: "1px solid #e2e8f0"
                  }}
                >
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Education Qualification */}
        {job.qualification && (
          <div style={{ marginBottom: "25px" }}>
            <h3 style={{ fontSize: "18px", color: "#1e293b", marginBottom: "8px" }}>Education Qualification</h3>
            <p style={{ color: "#334155" }}>{job.qualification}</p>
          </div>
        )}

        {/* Full Description */}
        <div style={{ marginBottom: "35px" }}>
          <h3 style={{ fontSize: "18px", color: "#1e293b", marginBottom: "10px" }}>Job Description</h3>
          <div style={{ color: "#334155", lineHeight: "1.7", whiteSpace: "pre-line" }}>
            {job.description}
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: "20px", flexWrap: "wrap", gap: "10px" }}>
          <span style={{ fontSize: "13px", color: "#94a3b8" }}>Posted {job.posted_date || "Recently"}</span>
          {hasApplied ? (
            <span
              className={`badge ${
                job.application_status === "shortlisted"
                  ? "bg-success"
                  : job.application_status === "rejected"
                  ? "bg-danger"
                  : "bg-info"
              }`}
              style={{ padding: "10px 20px", fontSize: "14px", fontWeight: "600" }}
            >
              {job.application_status === "shortlisted"
                ? "⭐ Shortlisted for this Job"
                : job.application_status === "rejected"
                ? "✕ Application Rejected"
                : "Job Applied ✓"}
            </span>
          ) : (
            <Link to={`/apply/${job.id}`} className="btn btn-primary" style={{ padding: "10px 24px", fontWeight: "600" }}>
              Apply for this Job
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default JobDetail;