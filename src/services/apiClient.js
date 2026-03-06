import axios from "axios";

const apiClient = axios.create({
  baseURL:
    "https://banquendpasionlectour-h9ftfhcggfb7h9cs.switzerlandnorth-01.azurewebsites.net",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

apiClient.interceptors.request.use(
  (config) => {
    console.log("REQUEST BASE URL =", config.baseURL);
    console.log("REQUEST URL =", config.url);

    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);

export default apiClient;
