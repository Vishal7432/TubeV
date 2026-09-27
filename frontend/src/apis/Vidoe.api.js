import axiosInstance from "./Axiosinstance";

// Adjust these paths/params if your backend's video routes differ.

export async function getAllVideos({
  query = "",
  sortBy = "createdAt",
  sortType = "desc",
  page = 1,
  limit = 8,
} = {}) {
  const { data } = await axiosInstance.get("/videos", {
    params: { query, sortBy, sortType, page, limit },
  });
  // Typical shape: { data: { docs: [...], totalDocs, hasNextPage, ... } } (mongoose-aggregate-paginate-v2)
  return data.data;
}

export async function getVideoById(videoId) {
  const { data } = await axiosInstance.get(`/videos/${videoId}`);
  return data.data;
}
