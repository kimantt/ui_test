import { useSelector } from "react-redux";
import httpClient from "./httpClient";

export const requestPaymentAndGiftMessage = async (paymentRequest, chatroomId) => {
  const res = await httpClient.post(`/payments/gift/${chatroomId}`, paymentRequest);
  return res.data;
};

export const requestPaymentAndFirstGiftMessage = async (paymentRequest, userId, username, receiverId, receiverName) => {
  const data = {
    paymentRequestDTO: paymentRequest,
    messageWithSenderDTO: {
      message: {
        type: "CHAT",
        userId: userId,
        sendDate: new Date(),
        content: "",
        isGift: "N",
        unreadCount: 1,
      },
      sender: {
          userId: userId,
          chatroomName: `${receiverName}님과의 채팅방`,
          connectionStatus: "ON",
          isDarkMode: "N",
      },
      receiverId: receiverId,
      senderName: username,
    },
  }

  const res = await httpClient.post(`/payments/gift/first`, data);
  return res.data;
};
