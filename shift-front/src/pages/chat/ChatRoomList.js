import React, { useState, useEffect, useContext, useRef } from "react";
import {
  Container,
  Form,
  Button,
  ListGroup,
  Navbar,
  InputGroup,
} from "react-bootstrap";
import { BsSearch, BsPlusLg } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";

import { StompContext } from "../../api/StompProvider";
import httpClient from '../../api/httpClient';
import ChatRoomListContextMenu from "../../components/chat/ChatRoomListContextMenu";
import MessengerBottomNav from "../../components/chat/MessengerBottomNav";
import { setRooms as setReduxRooms } from "../../store/chatSlice";
import ChatRoomListItem from "../../components/chat/ChatRoomListItem";
import MessengerSidebar from "../../components/chat/MessengerSidebar";
import "../../styles/MessengerLayout.css";

const ChatRoomListContent = ({ embedded }) => {
  const { stompReady } = useContext(StompContext);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [rooms, setRooms] = useState([]); // 채팅방 목록
  const [searchKeyword, setSearchKeyword] = useState(""); // 검색어
  const menuRef = useRef(null); // 우클릭 메뉴 참조

  const [searchMode, setSearchMode] = useState(false); // 검색 모드 ON/OFF
  const [searchNameResults, setSearchNameResults] = useState([]); // 사용자 이름 검색 결과
  const [searchMessageResults, setSearchMessageResults] = useState([]); // 메시지 검색 결과
  const [isComposing, setIsComposing] = useState(false);  // 한글 입력 중 상태


  // 채팅방 목록 가져오기
  const getChatRoomList = async (userId) => {
    try {
      const userChatRoomInfo = await httpClient.get(
        `http://localhost:8080/chatrooms`
      );
      setRooms(userChatRoomInfo.data);
      dispatch(setReduxRooms(userChatRoomInfo.data));
      console.log("채팅방 목록 호출 ", userChatRoomInfo.data);
    } catch (err) {
      console.error(err);
    }
  };

  // 주문번호 제거된 메시지 추출
  const getDisplayContent = (content) => {
    const parts = content.split("&");
    if (parts.length >= 3) {
      return parts.slice(0, parts.length - 2).join("&").trim();
    }
    return content; // 메시지 형식이 다를 경우 그대로 반환
  };

  // 마지막 채팅 날짜 포맷팅
  const formatLastChatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    // 오늘 0시 기준
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    // 날짜만 비교용
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    // 1) 오늘이면 "오전/오후 HH:mm"
    if (target.getTime() === today.getTime()) {
      const hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const ampm = hours < 12 ? "오전" : "오후";
      const displayHour = hours % 12 === 0 ? 12 : hours % 12;
      return `${ampm} ${displayHour}:${minutes}`;
    }
    // 2) 어제면 "어제"
    if (target.getTime() === yesterday.getTime()) {
      return "어제";
    }
    // 3) 올해면 "MM월 DD일"
    if (date.getFullYear() === now.getFullYear()) {
      return `${date.getMonth() + 1}월 ${date.getDate()}일`;
    }
    // 4) 올해가 아니면 "YYYY. M. D."
    return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`;
  };

  // 채팅방을 최근 메시지 날짜 내림차순 정렬
  const filteredRooms = [...rooms].sort((a, b) => {
    const dateA = a.lastMsgDate ? new Date(a.lastMsgDate) : 0;
    const dateB = b.lastMsgDate ? new Date(b.lastMsgDate) : 0;

    return dateB - dateA;
  });

  const accessToken = useSelector((state) => state.auth.accessToken);
  // 페이지 진입 시 실행
  useEffect(() => {
    if (!stompReady) return; // 연결 체크
    if (!accessToken) return; // 토큰 유무 체크

    const userId = accessToken ? jwtDecode(accessToken).sub : null;
    getChatRoomList(userId);
  }, [stompReady]);

  // CHATROOM_UPDATED 이벤트 수신 시 해당 채팅방 정보 갱신
  useEffect(() => {
    const handleChatroomUpdated = async (e) => {
      const { chatroomUserId, chatroomId } = e.detail;
      console.log("CHATROOM_UPDATED 이벤트 수신:", e.detail);

      try {
        // chatroomUserId 기반으로 단일 채팅방 정보 조회
        const res = await httpClient.get(
          `http://localhost:8080/chatroom/users/${Number(chatroomUserId)}`
        );
        const updated = res.data; // ChatroomListDTO 하나

        setRooms((prevRooms) => {
          // 이미 존재하는 방이면 그 항목만 교체
          const exists = prevRooms.some(
            (r) => r.chatroomUserId == updated.chatroomUserId
          );

          if (exists) {
            return prevRooms.map((r) =>
              r.chatroomUserId == updated.chatroomUserId
                ? { ...r, ...updated }
                : r
            );
          } else {
            // 새로 생긴 채팅방이라면 맨 앞에 추가
            return [updated, ...prevRooms];
          }
        });
      } catch (error) {
        console.error("단일 채팅방 정보 조회 실패:", error);
      }
    };

    window.addEventListener("CHATROOM_UPDATED", handleChatroomUpdated);

    return () => {
      window.removeEventListener("CHATROOM_UPDATED", handleChatroomUpdated);
    };
  }, []);

  // 사용자 이름으로 검색
  const searchByName = async (keyword) => {
    if (!keyword.trim()) {
      setSearchNameResults([]);
      return;
    }
    try {
      const res = await httpClient.get("/chatrooms/search/name", {
        params: { input: keyword }
      });
      setSearchNameResults(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // 메시지 내용으로 검색
  const searchByMessages = async (keyword) => {
    if (!keyword.trim()) {
      setSearchMessageResults([]);
      return;
    }
    try {
      const res = await httpClient.get("/chatrooms/search/messages", {
        params: { input: keyword }
      });
      setSearchMessageResults(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // 검색어가 변경될때마다 검색 실행
  useEffect(() => {
    if (!searchMode) return;
    
    searchByName(searchKeyword);
    searchByMessages(searchKeyword);
  }, [searchKeyword]);

  return (
    <Container
      fluid
      className={`p-0 bg-white d-flex flex-column ${embedded ? "h-100" : ""}`}
      style={{ height: embedded ? "100%" : "100vh", overflow: "hidden" }}
    >
      <ChatRoomListContextMenu rooms={rooms} setRooms={setRooms} ref={menuRef} />

      {/* Header */}
      <Navbar bg="light" className="border-bottom px-4 py-3">
        <Navbar.Brand className="fw-bold">채팅목록</Navbar.Brand>

        <Button variant="light" className="ms-auto" onClick={() => navigate("/chatroom/create")}>
          <BsPlusLg size={20} />
        </Button>
      </Navbar>

      {/* Search */}
      <div className="border-bottom p-4">
        <InputGroup>
          <InputGroup.Text>
            <BsSearch />
          </InputGroup.Text>
          <Form.Control
            placeholder="채팅방 검색"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onFocus={() => setSearchMode(true)}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            onBlur={() => {
              if (isComposing) return;
              if (searchKeyword.trim() === "") {
                setSearchMode(false);
              }
            }}
          />
        </InputGroup>
      </div>

      {/* Chat List */}
      <div className="flex-grow-1 overflow-auto" style={{ paddingBottom: "80px" }}>
        <div style={{ display: searchMode ? "block" : "none" }}>
          {/* 채팅방 이름 검색 결과 */}
          <h6 className="px-3 pt-3 fw-bold text-secondary">채팅방</h6>
          <ListGroup variant="flush">
            {searchNameResults.map((room) => (
              <ChatRoomListItem
                key={room.chatroomId}
                room={room}
                menuRef={menuRef}
                formatLastChatDate={formatLastChatDate}
                getDisplayContent={getDisplayContent}
              />
            ))}
            {searchNameResults.length === 0 && (
              <div className="text-muted small px-3 py-2">검색 결과 없음</div>
            )}
          </ListGroup>

          {/* 메시지 검색 결과 */}
          <h6 className="px-3 pt-4 fw-bold text-secondary">메시지</h6>
          <ListGroup variant="flush">
            {searchMessageResults.map((room) => (
              <ChatRoomListItem
                key={room.chatroomId}
                room={room}
                menuRef={menuRef}
                formatLastChatDate={formatLastChatDate}
                getDisplayContent={getDisplayContent}
              />
            ))}
            {searchMessageResults.length === 0 && (
              <div className="text-muted small px-3 py-2">검색 결과 없음</div>
            )}
          </ListGroup>

        </div>
      
        {/* 기존 채팅방 목록 */}
        <div style={{ display: searchMode ? "none" : "block" }}>
          <ListGroup variant="flush">
            {filteredRooms.map((room) => (
              <ChatRoomListItem
                key={room.chatroomId}
                room={room}
                menuRef={menuRef}
                formatLastChatDate={formatLastChatDate}
                getDisplayContent={getDisplayContent}
              />
            ))}
          </ListGroup>
        </div>
      </div>

      {/* Bottom Navigation*/}
      {!embedded && <MessengerBottomNav active="chat" />}
    </Container>
  );
};

const ChatRoomList = () => {
  return (
    <div className="messenger-layout">
      <MessengerSidebar active="chat" />

      <div className="messenger-column list-column">
        <ChatRoomListContent embedded />
      </div>

      <div className="messenger-column detail-column">
        <div className="messenger-placeholder">채팅방을 선택하면 대화가 표시됩니다.</div>
      </div>
    </div>
  );
};

export { ChatRoomListContent };
export default ChatRoomList;