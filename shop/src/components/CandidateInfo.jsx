import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import "../assets/style/CandidateInfo.css";

function CandidateInfo() {
  const { appId } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchCandidateDetails = async () => {
      try {
        const response = await API.get(`recruiter/applications/${appId}/`);
        setApplication(response.data);
      } catch (error) {
        console.error("API Error fetching candidate details from backend:", error);
        setApplication(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateDetails();
  }, [appId]);

  const handleAction = async (action) => {
    try {
      await API.post(`recruiter/applications/${appId}/update/`, { action });
      
      if (action === "shortlist") {
        setApplication((prev) => ({ ...prev, status: "shortlisted" }));
        setMessage("Candidate shortlisted successfully! Notification sent.");
      } else if (action === "reject") {
        setApplication((prev) => ({ ...prev, status: "rejected" }));
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
      <div className="candidate-info-loading">
        <p>Loading candidate profile...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="candidate-info-error">
        <p>Candidate application not found.</p>
        <button onClick={() => navigate(-1)} className="btn-back">Go Back</button>
      </div>
    );
  }

  return (
    <div className="candidate-info-container">
      <div className="candidate-info-card">
        {/* Header */}
        <div className="candidate-card-header">
          <div>
            <h2>{application.full_name}</h2>
            <p className="applied-job-subtitle">
              Applied for: <strong>{application.job_title}</strong> at {application.company_name}
            </p>
          </div>
          <span className={`status-badge ${application.status}`}>
            {application.status.toUpperCase()}
          </span>
        </div>

        {message && <div className="candidate-alert">{message}</div>}

        {/* Details Grid */}
        <div className="candidate-details-grid">
          <div className="detail-item">
            <span className="detail-label">Email Address</span>
            <span className="detail-value">
              <a href={`mailto:${application.email}`}>{application.email}</a>
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Phone Number</span>
            <span className="detail-value">
              <a href={`tel:${application.phone}`}>{application.phone}</a>
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Education / Qualification</span>
            <span className="detail-value">{application.education}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Applied On</span>
            <span className="detail-value">{application.applied_at}</span>
          </div>
        </div>

        {/* Resume Section */}
        <div className="resume-section">
          <span className="detail-label">Candidate Resume</span>
          {application.resume_url ? (
            <a
              href={
                application.resume_url.startsWith("http")
                  ? application.resume_url
                  : `http://127.0.0.1:8000${application.resume_url}`
              }
              target="_blank"
              rel="noopener noreferrer"
              download
              className="btn-download-resume"
            >
              📄 Download / View Resume
            </a>
          ) : (
            <p className="no-resume-text">No resume file attached.</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="candidate-actions-footer">
          <button onClick={() => navigate(-1)} className="btn-back">
            ← Back to Job Candidates
          </button>

          <div className="decision-buttons">
            <button
              onClick={() => handleAction("reject")}
              className="btn-reject"
              disabled={application.status === "rejected"}
            >
              ✕ Reject Application
            </button>
            <button
              onClick={() => handleAction("shortlist")}
              className="btn-shortlist"
              disabled={application.status === "shortlisted"}
            >
              ⭐ Shortlist Candidate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CandidateInfo;
