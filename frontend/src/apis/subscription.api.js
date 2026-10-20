import axiosInstance from "./Axiosinstance.js";

// Adjust the path if your subscription routes differ.
export async function toggleSubscription(channelId) {
  const { data } = await axiosInstance.post(`/subscriptions/c/${channelId}`);
  return data.data; // { subscribed: true | false }
}
