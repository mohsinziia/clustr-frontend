import api from "../api/axios";

export const toggleLike = async (videoId: string) => {
  // Routes to like.controller.js
  return await api.post(`/likes/toggle/v/${videoId}`);
};

export const toggleSubscribe = async (channelId: string) => {
  // Routes to subscription.controller.js
  return await api.post(`/subscriptions/c/${channelId}`);
};
