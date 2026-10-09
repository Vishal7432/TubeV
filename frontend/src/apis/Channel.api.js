import axiosInstance from "./Axiosinstance.js";

// Adjust these paths if your backend's dashboard routes differ.

export async function getChannelProfile(username) {
  const { data } = await axiosInstance.get(
    `/users/c/${encodeURIComponent(username)}`,
  );
  return data.data;
}

export async function getChannelPosts(userId) {
  const { data } = await axiosInstance.get(`/tweets/user/${userId}`);
  return data.data;
}

export async function createChannelPost({ content, image }) {
  const formData = new FormData();
  if (content.trim()) formData.append("content", content.trim());
  if (image) formData.append("image", image);

  const { data } = await axiosInstance.post("/tweets", formData);
  return data.data;
}

export async function getChannelStats() {
  const { data } = await axiosInstance.get("/dashboard/stats");
  // Typical shape from this style of backend: { data: { totalViews, totalSubscribers, totalLikes, totalVideos } }
  return data.data;
}

export async function getChannelVideos() {
  const { data } = await axiosInstance.get("/dashboard/videos");
  return data.data; // array of video docs owned by the logged-in channel
}
