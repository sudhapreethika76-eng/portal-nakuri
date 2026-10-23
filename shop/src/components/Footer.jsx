import React from "react";
import { Link } from "react-router-dom";
import "../assets/style/Footer.css";

function Footer() {
  return (
    <footer className="naukri-footer">
      <div className="footer-top">
        <div className="footer-container">
          {/* Brand Info */}
          <div className="footer-col brand-col">
            <div className="footer-logo">
              <span className="logo-icon">JobNest</span>
              
            </div>
            
            <div className="social-links">
              <a href="#facebook" className="social-icon" aria-label="Facebook"><i className="bi bi-facebook"></i></a>
              <a href="#twitter" className="social-icon" aria-label="Twitter"><i className="bi bi-twitter-x"></i></a>
              <a href="#linkedin" className="social-icon" aria-label="LinkedIn"><i className="bi bi-linkedin"></i></a>
              <a href="#instagram" className="social-icon" aria-label="Instagram"><i className="bi bi-instagram"></i></a>
            </div>
          </div>

          {/* Jobseekers */}
          <div className="footer-col">
            <h4>For Job Seekers</h4>
            <ul>
          
              <li><Link to="#">Upload Resume</Link></li>
              <li><Link to="#">Career Guidance</Link></li>
              <li><Link to="#">Job Alerts</Link></li>
            </ul>
          </div>

          {/* Employers */}
          <div className="footer-col">
            <h4>For Employers</h4>
            <ul>
              <li><Link to="/recruiter">Post a Job</Link></li>
              <li><Link to="/recruiter">Search Resumes</Link></li>
              <li><Link to="#">Recruiter Solutions</Link></li>
             
            </ul>
          </div>

          {/* Top Locations */}
          <div className="footer-col">
            <h4>Popular Locations</h4>
            <ul>
              <li><a href="#bengaluru">Jobs in Bengaluru</a></li>
              <li><a href="#hyderabad">Jobs in Hyderabad</a></li>
             
              <li><a href="#remote">Remote Jobs</a></li>
            
            </ul>
          </div>
        </div>
      </div>

      
      
    </footer>
  );
}

export default Footer;