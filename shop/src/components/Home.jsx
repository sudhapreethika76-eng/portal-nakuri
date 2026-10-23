import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import "../assets/style/Home.css";

function Home() {
  const [username, setUsername] = useState("");
  const [jobs, setJobs] = useState([]);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userRole = localStorage.getItem("role");
    if (userRole === "recruiter") {
      navigate("/recruiter", { replace: true });
      return;
    }

    const savedUser = localStorage.getItem("username") || "Student";
    setUsername(savedUser);
    const qParam = searchParams.get("q") || "";
    setQuery(qParam);
    fetchJobs(qParam);
  }, [searchParams, navigate]);

  const fetchJobs = async (searchQuery) => {
    setLoading(true);
    try {
      const response = await API.get("jobs/", { params: { q: searchQuery } });
      if (response.data && response.data.jobs) {
        setJobs(response.data.jobs);
      } else {
        setJobs([]);
      }
    } catch (error) {
      console.warn("Failed fetching live jobs from database:", error);
      setJobs([]); // No mock data fallback; shows empty state if server is offline
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(query ? { q: query } : {});
  };

  // Filter jobs based on active tab ("all" vs "applied")
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      !query ||
      job.title.toLowerCase().includes(query.toLowerCase()) ||
      job.company_name.toLowerCase().includes(query.toLowerCase()) ||
      job.location.toLowerCase().includes(query.toLowerCase()) ||
      (job.skills && job.skills.toLowerCase().includes(query.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === "applied") {
      return job.has_applied === true;
    }

    return true;
  });

  const appliedJobsCount = jobs.filter((job) => job.has_applied).length;

  return (
    <div className="student-home-container" style={{ padding: "30px 20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Hero Welcome Card */}
      <div
        className="student-welcome-card"
        style={{
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          color: "#ffffff",
          padding: "36px",
          borderRadius: "16px",
          marginBottom: "30px",
          boxShadow: "0 10px 25px rgba(15, 23, 42, 0.15)",
        }}
      >
        <h1 style={{ fontSize: "30px", fontWeight: "700", marginBottom: "8px" }}>
          Welcome to JobNest, {username}! 👋
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "16px", marginBottom: "24px" }}>
          Discover top career opportunities matched to your skill set.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "280px" }}>
            <input
              type="text"
              className="form-control"
              placeholder="🔍 Search by job title, company, skills, or location..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                padding: "14px 20px",
                borderRadius: "10px",
                border: "none",
                fontSize: "15px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              padding: "14px 28px",
              borderRadius: "10px",
              fontWeight: "600",
              fontSize: "15px",
              backgroundColor: "#2563eb",
              border: "none",
            }}
          >
            Search Jobs
          </button>
        </form>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "25px", borderBottom: "2px solid #e2e8f0", paddingBottom: "10px" }}>
        <button
          className={`btn ${activeTab === "all" ? "btn-primary" : "btn-light"}`}
          onClick={() => setActiveTab("all")}
          style={{ fontWeight: "600", borderRadius: "8px" }}
        >
          🌐 All Openings ({jobs.length})
        </button>
        <button
          className={`btn ${activeTab === "applied" ? "btn-primary" : "btn-light"}`}
          onClick={() => setActiveTab("applied")}
          style={{ fontWeight: "600", borderRadius: "8px" }}
        >
          ✅ Applied Jobs ({appliedJobsCount})
        </button>
      </div>

      {/* Job Feed List */}
      <div className="job-feed-section">
        <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#1e293b", marginBottom: "20px" }}>
          {activeTab === "applied" ? "Your Job Applications" : "Recommended Opportunities"}
        </h2>

        {loading ? (
          <p style={{ color: "#64748b" }}>Loading job opportunities...</p>
        ) : filteredJobs.length === 0 ? (
          <div style={{ background: "#ffffff", padding: "40px", borderRadius: "12px", textAlign: "center", border: "1px solid #e2e8f0" }}>
            <p style={{ color: "#64748b", fontSize: "16px" }}>
              {activeTab === "applied" ? "You haven't applied to any jobs yet." : "No job postings available from recruiters yet."}
            </p>
            {query && (
              <button className="btn btn-outline-primary mt-2" onClick={() => { setQuery(""); setSearchParams({}); }}>
                Clear Search Filters
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gap: "20px" }}>
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                style={{
                  background: "#ffffff",
                  padding: "26px",
                  borderRadius: "14px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "4px" }}>
                      <Link to={`/job/${job.id}`} style={{ color: "#0f172a", textDecoration: "none" }}>
                        {job.title}
                      </Link>
                    </h3>
                    <p style={{ color: "#475569", fontWeight: "600", margin: 0, fontSize: "15px" }}>
                      🏢 {job.company_name} &nbsp;•&nbsp; 📍 {job.location}
                    </p>
                  </div>
                  {job.has_applied ? (
                    <span
                      className={`badge ${
                        job.application_status === "shortlisted"
                          ? "bg-success"
                          : job.application_status === "rejected"
                          ? "bg-danger"
                          : "bg-info"
                      }`}
                      style={{ padding: "8px 12px", fontSize: "12px" }}
                    >
                      {job.application_status === "shortlisted"
                        ? "⭐ Shortlisted"
                        : job.application_status === "rejected"
                        ? "✕ Rejected"
                        : "Applied ✓"}
                    </span>
                  ) : (
                    <span className="badge bg-primary" style={{ padding: "8px 12px", fontSize: "12px" }}>
                      {job.job_type || "Full-time"}
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", gap: "20px", color: "#64748b", fontSize: "14px", margin: "14px 0", flexWrap: "wrap" }}>
                  {job.salary && <span>💰 <strong>{job.salary}</strong></span>}
                  {job.experience && <span>🎓 <strong>{job.experience}</strong></span>}
                  <span>👥 <strong>{job.vacancies || 1} Vacancy(ies)</strong></span>
                </div>

                {job.skills && (
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
                    {job.skills.split(",").map((skill, index) => (
                      <span
                        key={index}
                        style={{
                          background: "#f1f5f9",
                          color: "#475569",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: "500",
                        }}
                      >
                        {skill.trim()}
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
                    paddingTop: "16px",
                    marginTop: "10px",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <Link to={`/job/${job.id}`} style={{ color: "#2563eb", textDecoration: "none", fontWeight: "600", fontSize: "14px" }}>
                    View Full Description →
                  </Link>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <Link to={`/job/${job.id}`} className="btn btn-outline-secondary btn-sm" style={{ fontWeight: "600" }}>
                      Details
                    </Link>
                    {job.has_applied ? (
                      <button className="btn btn-sm btn-secondary" disabled style={{ fontWeight: "600", padding: "6px 18px" }}>
                        {job.application_status === "shortlisted"
                          ? "Shortlisted"
                          : job.application_status === "rejected"
                          ? "Rejected"
                          : "Job Applied"}
                      </button>
                    ) : (
                      <Link
                        to={`/apply/${job.id}`}
                        className="btn btn-sm btn-primary"
                        style={{ fontWeight: "600", padding: "6px 18px" }}
                      >
                        Apply Now
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;