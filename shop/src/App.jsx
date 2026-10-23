import React, { useEffect } from "react";
import { HashRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import AOS from 'aos';
import 'aos/dist/aos.css';
import './App.css';

import Home from './components/Home';
import Nav from './components/Navbar';         
import Footer from './components/Footer';  
import Login from './components/Login';
import Register from './components/Register';  
import Recruiter from './components/Recruiter'; 
import Adminpage from './components/Adminpage';
import JobDetail from './components/JobDetail';
import ApplyJob from './components/ApplyJob';
import RecruiterCandidates from './components/RecruiterCandidates';
import CandidateInfo from './components/CandidateInfo';

function MainLayout() {
    return (
        <div className="main-layout-wrapper" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Nav />
            <main style={{ flex: 1, backgroundColor: "#f8fafc", paddingBottom: "40px" }}>
                <Outlet /> 
            </main>
            <Footer />
        </div>
    );
}

function AuthLayout() {
    return (
        <div className="auth-container">
            <Outlet /> 
        </div>
    );
}

function App() {
    useEffect(() => {
        AOS.init({ duration: 1000, once: true });
    }, []);

    return (
        <HashRouter>
            <Routes>
                {/* Routes WITH Navbar and Footer (Authenticated / Main Views) */}
                <Route element={<MainLayout />}>
                    <Route path="/home" element={<Home />} />
                    <Route path="/recruiter" element={<Recruiter />} />
                    <Route path="/admin" element={<Adminpage />} />
                    
                    <Route path="/job/:jobId" element={<JobDetail />} />
                    <Route path="/apply/:jobId" element={<ApplyJob />} />
                    <Route path="/recruiter/job/:jobId/candidates" element={<RecruiterCandidates />} />
                    <Route path="/candidate/:appId" element={<CandidateInfo />} />
                </Route>

                {/* Routes WITHOUT Navbar and Footer (Public Auth Views) */}
                <Route element={<AuthLayout />}>
                    <Route path="/" element={<Login />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Route>

                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </HashRouter>
    );
}

export default App;