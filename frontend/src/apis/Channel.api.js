import axiosInstance from "./Axiosinstance";

// Adjust these paths if your backend's dashboard routes differ.

export async function getChannelStats() {
  const { data } = await axiosInstance.get("/dashboard/stats");
  // Typical shape from this style of backend: { data: { totalViews, totalSubscribers, totalLikes, totalVideos } }
  return data.data;
}

export async function getChannelVideos() {
  const { data } = await axiosInstance.get("/dashboard/videos");
  return data.data; // array of video docs owned by the logged-in channel
}
