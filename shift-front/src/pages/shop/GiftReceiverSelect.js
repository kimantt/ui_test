import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import FriendList from "../chat/FriendList";
import { setCurrentRoomId } from "../../store/chatSlice";
import httpClient from "../../api/httpClient";

const GiftReceiverSelect = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const items = location.state?.items || [];

  const handleSelectFriend = async (friend) => {
    const receiverId = friend.friendId ?? friend.id;
    const receiverName = friend.name ?? friend.loginId ?? "선물받는 친구";

    // 선택한 친구와의 채팅방이 있는지 조회
    try {
      console.log("채팅방 조회 시도 for friendId:", friend.friendId);
      const response = await httpClient.get(`http://localhost:8080/chatroom/users/receiver/${friend.friendId}`);
  
      console.log("기존 채팅방 있음:", response.data);
      // 기존 채팅방이 있다면 새로 만들지 않도록 chatroomId 설정
      dispatch(setCurrentRoomId(response.data.chatroomId));

    } catch (err) {
      console.log("기존 채팅방 없음");
    }

    // 쇼핑몰 → 친구 선택은 채팅 플로우 false로 설정
    if (typeof window !== "undefined") {
      window.SHIFT_FROM_CHAT = false;
      window.SHIFT_RECEIVER_ID = receiverId;
      window.SHIFT_RECEIVER_NAME = receiverName;
    }

    navigate("/checkout", {
      state: {
        items,
        receiverId,
        receiverName,
        isGift: true,
        isVoucherOrder: location.state?.isVoucherOrder === true
      },
    });
  };

  return <FriendList onSelectFriend={handleSelectFriend} />;
};

export default GiftReceiverSelect;
