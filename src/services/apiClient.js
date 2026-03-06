// src/services/apiClient.js
import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://passionlecturebackend-fthxdjardfg6b5h5.switzerlandnorth-01.azurewebsites.net",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

//  Inject token automatically on every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // important: if no token, ensure we don't keep an old Authorization header
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

//  Optional: handle 401 globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      // Received 401 Unauthorized from API.
      // NOTE: do NOT auto-clear tokens or force a redirect here —
      // this can cause the app to repeatedly ask the user to log in
      // when some requests (CORS, public endpoints, or cookie issues)
      // return 401 for reasons unrelated to the user's session.
      // Let the app decide what to do (refresh token, prompt login, etc.).
      // Add a console hint for debugging.
      // eslint-disable-next-line no-console
      console.warn(
        "apiClient: received 401 Unauthorized — not auto-logging out"
      );
    }

    return Promise.reject(error);
  }
);

export default apiClient;
