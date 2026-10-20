import axiosInstance from "./Axiosinstance.js";

export async function getVideoComments(videoId, page = 1) {
  const { data } = await axiosInstance.get(`/comments/${videoId}`, {
    params: { page },
  });
  return data.data;
}

export async function addComment(videoId, content) {
  const { data } = await axiosInstance.post(`/comments/${videoId}`, {
    content,
  });
  return data.data;
}
