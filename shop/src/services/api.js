import axios from "axios";

const API = axios.create({
    baseURL: "http://127.0.0.1:8000/job/",
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to automatically attach JWT token, excluding auth routes
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access");
        const isAuthRoute = config.url.includes("login/") || config.url.includes("register/");

        if (token && !isAuthRoute) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            delete config.headers.Authorization;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default API;