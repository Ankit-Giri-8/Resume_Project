import axios from 'axios';
import {BASE_URL} from './apiPaths.js';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000, // Set a timeout of 10 seconds
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    }
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('token');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
          if (error.response.status === 401) {
            window.location.href = "/";
          } else if (error.response.status === 500) {
            console.error("Server error");
          }
        } 
        else if (error.response.status === "ECONNABORTED") {
          console.error("Request timeout");
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
