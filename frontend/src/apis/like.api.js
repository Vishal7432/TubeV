import axiosInstance from "./Axiosinstance.js";

export async function toggleVideoLike(videoId) {
  const { data } = await axiosInstance.post(`/likes/toggle/v/${videoId}`);
  return data.data;
}
