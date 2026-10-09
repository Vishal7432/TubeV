import axiosInstance from "./Axiosinstance.js";

// Adjust these paths/params if your backend's video routes differ.

export async function getAllVideos({
  query = "",
  sortBy = "createdAt",
  sortType = "desc",
  page = 1,
  limit = 8,
  userId,
} = {}) {
  const { data } = await axiosInstance.get("/videos", {
    params: { query, sortBy, sortType, page, limit, userId },
  });
  // Typical shape: { data: { docs: [...], totalDocs, hasNextPage, ... } } (mongoose-aggregate-paginate-v2)
  return data.data;
}

export async function getVideoById(videoId) {
  const { data } = await axiosInstance.get(`/videos/${videoId}`);
  return data.data;
}
