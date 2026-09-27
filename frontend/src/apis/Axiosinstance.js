import axios from "axios";

// Set VITE_API_BASE_URL in a .env file, e.g.:
// VITE_API_BASE_URL=https://social-media-backend-mxz5.onrender.com/api/v1
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // sends the httpOnly accessToken/refreshToken cookies
});

// --- Refresh-token queueing ---
// If several requests 401 at once, we only want ONE refresh call; the rest
// should wait for it and then retry with the new token.
let isRefreshing = false;
let pendingQueue = [];

function resolvePendingQueue(error) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  pendingQueue = [];
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Don't try to refresh on the refresh/login endpoints themselves —
    // that would loop forever if the refresh token is also invalid.
    const isAuthRoute =
      originalRequest.url?.includes("/users/login") ||
      originalRequest.url?.includes("/users/refresh-token");

    if (status === 401 && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        // Wait for the in-flight refresh to finish, then retry.
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then(() => axiosInstance(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axiosInstance.post("/users/refresh-token");
        resolvePendingQueue(null);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        resolvePendingQueue(refreshError);
        // Refresh failed — session is genuinely over.
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;