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

export async function recordVideoView(videoId) {
  const { data } = await axiosInstance.post(`/videos/${videoId}/view`);
  return data.data;
}

export async function publishVideo(formData, onProgress) {
  // formData fields: title, description, videoFile, thumbnail
  const { data } = await axiosInstance.post("/videos", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onProgress && e.total)
        onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });
  return data.data;
}
