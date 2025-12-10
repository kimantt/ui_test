import React, { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import {
  Col,
  Row,
  Container,
  Navbar,
  Button,
  InputGroup,
  Form,
} from "react-bootstrap";

import { BsXLg, BsFillSendFill, BsPlusLg, BsEmojiSmile } from "react-icons/bs";

import { StompContext } from "../../api/StompProvider";
import httpClient from "../../api/httpClient";
import { setCurrentRoomId } from "../../store/chatSlice";

const NewChatRoom = ({ friend: friendProp, roomName: roomNameProp }) => {
  const { stompReady } = useContext(StompContext);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // 현재 사용자 ID, 이름
  const accessToken = useSelector((state) => state.auth.accessToken);
  const userId = accessToken ? jwtDecode(accessToken).sub : null;
  const username = accessToken ? jwtDecode(accessToken).name : null;

  const roomData = location.state?.room;
  const friend = friendProp || location.state?.friend;
  const roomName = roomNameProp || location.state?.roomName;

  const [inputText, setInputText] = useState("");
  const [showEmoticons, setShowEmoticons] = useState(false);
  const [showPlusPanel, setShowPlusPanel] = useState(false);

  const emoticons = ["😊", "😂", "❤️", "👍", "😢", "😮", "🎉", "🎁"];

  // 페이지 잘못 들어왔을 때
  if (!friend || !roomName) {
    return (
      <Container className="p-5 text-center">
        잘못된 접근입니다.
      </Container>
    );
  }

  const handlePlusClick = () => {
    setShowPlusPanel(!showPlusPanel);
    setShowEmoticons(false);
  };

  const handleSmileClick = () => {
    setShowEmoticons(!showEmoticons);
    setShowPlusPanel(false);
  };

  const handleEmoticonSelect = (emo) => {
    console.log("Selected emoticon:", emo);
    setShowEmoticons(false);
  };

  // 첫 메시지를 보낼 때 새로운 채팅방 생성 & 구독 시작
  const sendFirstMessage = async () => {
    try {
      const message = {
        type: "CHAT",
        userId: userId,
        sendDate: new Date(),
        content: inputText,
        isGift: "N",
        unreadCount: 1,
      }

      const data = {
        message: message,
        sender: {
          userId: userId,
          chatroomName: roomName,
          connectionStatus: "ON",
          isDarkMode: "N",
        },
        receiverId: friend.friendId,
        senderName: username,
      };

      // 새 채팅방을 생성 + 메시지 저장 + 방 ID 반환
      const newRoomIDResponse = await httpClient.post("http://localhost:8080/chatrooms", data);

      const newRoomId = newRoomIDResponse.data;
      const newRoomDataResponse = await httpClient.get(`http://localhost:8080/chat/users/${newRoomId}`);

      navigate(`/chatroom/${newRoomId}`, { state: { room: newRoomDataResponse.data } });

    } catch (error) {
      console.error("새 채팅방 생성 실패:", error);
      alert("채팅방 생성 중 오류.");
    }
  };

  // 메시지 전송 핸들러
  const handleSend = () => {
    if (!stompReady) return;
    if (!inputText.trim()) return;

    sendFirstMessage();
  };

  return (
    <Container
      fluid
      className="p-0 d-flex flex-column h-100 bg-white"
    >
      {/* Header */}
      <Navbar
        bg="light"
        className="px-3 border-bottom d-flex align-items-center justify-content-between"
      >
        <Navbar.Brand className="m-0">
          {roomName}
        </Navbar.Brand>
        <Button variant="light" onClick={() => navigate("/chatroom/list")}>
          <BsXLg />
        </Button>
      </Navbar>

      {/* Messages */}
      <div
        className="flex-grow-1 overflow-auto p-3"
        style={{ background: "#f7f7f7" }}
      >
      </div>

      {/* Plus Panel */}
      {showPlusPanel && (
        <div className="border-top bg-white p-3">
          <Row>
            <Col>
              <Button
                variant="light"
                className="w-100 py-4 border border-dark"
                onClick={() => {
                  // =====================================================================
                  // ★ 수정 2 — window.SHIFT 저장 + navigate 시 receiverId, receiverName 전달
                  // =====================================================================
                  window.SHIFT_RECEIVER_ID = friend.friendId;
                  window.SHIFT_RECEIVER_NAME = friend.name;
                  window.SHIFT_GIFT_FROM_CHAT = true;
                  window.SHIFT_GIFT_FROM_FRIEND = false;

                  navigate("/shop", {
                    state: {
                      isGift: true,
                      receiverId: friend.friendId,
                      receiverName: friend.name,
                    },
                  });
                  // =====================================================================
                }}
              >
                상품 선물
              </Button>
            </Col>

            <Col>
              <Button
                variant="light"
                className="w-100 py-4 border border-dark"
                onClick={() => {
                  // =====================================================================
                  // ★ 금액권 선물도 동일하게 처리
                  // =====================================================================
                  window.SHIFT_RECEIVER_ID = friend.friendId;
                  window.SHIFT_RECEIVER_NAME = friend.name;
                  window.SHIFT_GIFT_FROM_CHAT = true;
                  window.SHIFT_GIFT_FROM_FRIEND = false;

                  navigate("/gift-card", {
                    state: {
                      isGift: true,
                      isVoucherOrder: true,
                      receiverId: friend.friendId,
                      receiverName: friend.name,
                    },
                  });
                  // =====================================================================
                }}
              >
                금액권 선물
              </Button>
            </Col>
          </Row>
        </div>
      )}

      {/* Emoticon Panel */}
      {showEmoticons && (
        <div className="border-top bg-white p-3">
          <Row>
            {emoticons.map((emo, idx) => (
              <Col xs={3} key={idx} className="p-2 text-center">
                <Button
                  variant="light"
                  className="w-100 p-3 border"
                  onClick={() => handleEmoticonSelect(emo)}
                >
                  <span style={{ fontSize: "24px" }}>{emo}</span>
                </Button>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* Input */}
      <div className="border-top bg-white p-3">
        <InputGroup>
          <Button variant="outline-secondary" onClick={handlePlusClick}>
            <BsPlusLg />
          </Button>

          <Button variant="outline-secondary" onClick={handleSmileClick}>
            <BsEmojiSmile />
          </Button>

          <Form.Control
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (!e.shiftKey) {
                  e.preventDefault(); // 줄바꿈 방지
                  handleSend();
                }
              }
            }}
          />

          <Button variant="dark" onClick={handleSend}>
            <BsFillSendFill />
          </Button>
        </InputGroup>
      </div>
    </Container>
  );
};

export default NewChatRoom;
