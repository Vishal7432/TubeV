import axiosInstance from "./Axiosinstance.js";

// Adjust the field names (email/username) to match your backend's login controller.

export async function register(formData) {
  // formData must be a FormData instance (fields: fullName, email, username,
  // password, avatar, coverImage) since the backend expects multipart/form-data.
  const { data } = await axiosInstance.post("/users/register", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
}

export async function login({ email, password }) {
  const { data } = await axiosInstance.post("/users/login", {
    email,
    password,
  });
  return data.data; // { user, accessToken, refreshToken } — cookies are set server-side
}

export async function logout() {
  await axiosInstance.post("/users/logout");
}

export async function getCurrentUser() {
  const { data } = await axiosInstance.get("/users/current-user");
  return data.data;
}
