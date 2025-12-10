import httpClient from "./httpClient";

export const getReceivedGifts = async () => {
  const response = await httpClient.get('/gifts/received');
  return response.data;
};

export const getGiftDetail = async (orderId) => {
  const response = await httpClient.get(`/gifts/${orderId}`);
  return response.data;
};

// 선물 수락
export const acceptGift = async (orderId) => {
  const response = await httpClient.put(`/orders/${orderId}/gift/accept`);
  return response.data;
};

// 구매/수령 확정
export const confirmGift = async (orderId) => {
  const response = await httpClient.put(`/orders/${orderId}/confirm`);
  return response.data;
};