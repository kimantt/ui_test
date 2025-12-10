import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useSelector, useDispatch } from "react-redux";
import { updateUnread, setRooms } from "../store/chatSlice";
import httpClient from "./httpClient";

export const ChatroomGlobalSubscribe = (client, stompReady) => {
  const dispatch = useDispatch();
  const accessToken = useSelector((state) => state.auth.accessToken);

  // Redux.rooms 세팅
  useEffect(() => {
    if (!stompReady) return;
    if (!accessToken) return;

    const loadRoomsOnce = async () => {
      const res = await httpClient.get("http://localhost:8080/chatrooms");
      dispatch(setRooms(res.data));
      console.log("Redux.rooms 초기 로딩 완료");
    };

    loadRoomsOnce();
  }, [stompReady, accessToken]);

  // 실시간 전역 구독
  useEffect(() => {
    if (!stompReady) return;
    if (!client) return;
    if (!accessToken) return;

    const userId = Number(jwtDecode(accessToken).sub);

    console.log("전역 채팅 구독 시작:", userId);

    const subscription = client.subscribe(
      `/sub/chatroom-list/${userId}`,
      (message) => {
        const event = JSON.parse(message.body);
        console.log("개인 채널 이벤트:", event);

        // 채팅방 안읽은 메시지 수 업데이트
        dispatch(
          updateUnread({
            chatroomId: event.chatroomId,
            unreadCount: event.unreadCount,
          })
        );

        // 다른 컴포넌트에서 들을 수 있도록 전역 이벤트 발행
        window.dispatchEvent(
          new CustomEvent("CHATROOM_UPDATED", {
            detail: {
              chatroomId: event.chatroomId,
              chatroomUserId: event.chatroomUserId,
            },
          })
        );
      }
    );

    return () => {
      console.log("전역 구독 해제");
      subscription.unsubscribe();
    };
  }, [client, stompReady, accessToken, dispatch]);
};
