import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { BsArrowLeft, BsX, BsSearch } from "react-icons/bs";
import { Button, Container, Row, Col, ListGroup, Form, InputGroup } from "react-bootstrap";

import { StompContext } from "../../api/StompProvider";
import httpClient from '../../api/httpClient';

const CreateChatRoom = () => {
  const { stompReady } = useContext(StompContext);
  const navigate = useNavigate();

  // 친구 정보 리스트
  const [friendInfoList, setFriendInfoList] = useState([]);
  // 선택된 친구 리스트
  const [selectedFriends, setSelectedFriends] = useState([]);

  // 검색어
  const [searchKeyword, setSearchKeyword] = useState("");

  const accessToken = useSelector((state) => state.auth.accessToken);
  const userId = accessToken ? jwtDecode(accessToken).sub : null;
  const username = accessToken ? jwtDecode(accessToken).name : null;
  // 페이지 진입 시 실행
  useEffect(() => {
    if (!stompReady) return; // 연결 체크
    if (!accessToken) return; // 토큰 유무 체크
    
    getFriendsList(userId);
  }, [stompReady]);

  // 친구 목록 가져오기
  const getFriendsList = async (userId) => {
    try {
      const response = await httpClient.get(`http://localhost:8080/friends/users/${userId}`);
      console.log("friendList.data", response.data);
      setFriendInfoList(response.data);

    } catch (err) {
      console.error(err);
    }
  };

  // 친구 선택 토글
  const handleToggleFriend = (friendId) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  // 선택된 친구 제거
  const handleRemoveSelected = (friendId) => {
    setSelectedFriends((prev) => prev.filter((id) => id !== friendId));
  };

  // 채팅방 생성 핸들러
  const handleCreateChat = async () => {
    // 현재 1대1 채팅만 가능하기 때문에 1명만 선택되어야 함
    if (selectedFriends.length !== 1) {
      alert("1명만 선택해주세요.");
      return;
    }

    const friendData = friendInfoList.find(
      f => f.friendId === selectedFriends[0]
    );

    // 기존 채팅방 있으면 바로 이동, 없으면 채팅방 이름 설정 모달 열기
    try {
      console.log("기존 채팅방 조회 시도 for friendId:", friendData.friendId);
      const response = await httpClient.get(`http://localhost:8080/chatroom/users/receiver/${friendData.friendId}`);

      console.log("기존 채팅방 있음:", response.data);
      const chatroomUserDTO = response.data;

      if (chatroomUserDTO.connectionStatus === 'DL') {
        await httpClient.post(`http://localhost:8080/chatroom/users/restore`,
          {
            chatroomId:chatroomUserDTO.chatroomId,
            senderId:userId,
            receiverId:friendData.friendId,
            senderName:username,
            receiverName:friendData.name,
          }
        );
        const refresh = await httpClient.get(`http://localhost:8080/chatroom/users/${chatroomUserDTO.chatroomUserId}`);
        console.log(refresh);
        navigate(`/chatroom/${chatroomUserDTO.chatroomId}`, { state: { room : refresh.data } });
      }
      else {
        // 기존 채팅방으로 이동
        navigate(`/chatroom/${chatroomUserDTO.chatroomId}`, { state: { room : chatroomUserDTO } });
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        console.log("기존 채팅방 없음");

        const friendData = friendInfoList.find(
          f => f.friendId === selectedFriends[0]
        );

        // 새 채팅방 페이지로 이동 (아직 채팅방 생성 X)
        navigate("/chatroom/new", {
          state: {
            friend: friendData,
            roomName: `${friendData.name}님과의 채팅방`,
          },
        });

      } else {
        console.error(err);
        alert("기존 채팅방 조회 중 오류 발생");
      }
    }
  };

  // 선택된 친구 정보 리스트
  const selectedFriendsList = friendInfoList.filter((f) =>
    selectedFriends.includes(f.friendId)
  );

  // 검색어로 필터링된 친구 리스트
  const filteredFriends = friendInfoList.filter((friend) => {
    const keyword = searchKeyword.toLowerCase();

    return (
      friend.name.toLowerCase().includes(keyword) ||
      friend.loginId.toLowerCase().includes(keyword)
    );
  });

  return (
    <Container
      fluid
      className="d-flex flex-column"
      style={{
        height: "100vh",
        maxWidth: "480px",
        borderLeft: "1px solid #ddd",
        borderRight: "1px solid #ddd",
        backgroundColor: "#fff",
      }}
    >
      {/* HEADER */}
      <Row className="p-4 border-bottom">
        <Col className="d-flex align-items-center gap-3">
          <Button variant="light" onClick={() => navigate("/chatroom/list")}>
            <BsArrowLeft size={22} />
          </Button>
          <h3 className="m-0">채팅방 생성</h3>
        </Col>
      </Row>

      {/* SELECTED FRIENDS */}
      {selectedFriends.length > 0 && (
        <Row className="px-4 py-2 border-bottom">
          <div className="d-flex gap-3 overflow-auto">
            {selectedFriendsList.map((friend) => (
              <div key={friend.friendId} className="text-center" style={{ paddingTop: "8px" }}>
                <div className="position-relative d-inline-block mb-2">
                  <div
                    className="d-flex justify-content-center align-items-center"
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "50%",
                      border: "2px solid black",
                      backgroundColor: "#fff",
                    }}
                  >
                    <strong>{friend.name[0]}</strong>
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="dark"
                    onClick={() => handleRemoveSelected(friend.friendId)}
                    className="position-absolute p-0 d-flex justify-content-center align-items-center"
                    style={{
                      top: "-6px",
                      right: "-6px",
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                    }}
                  >
                    <BsX size={14} />
                  </Button>
                </div>
                <div style={{ fontSize: "12px" }}>{friend.name}</div>
              </div>
            ))}
          </div>
        </Row>
      )}

      {/* Search Section */}
      <div className="border-bottom p-4">
          <InputGroup>
          <InputGroup.Text>
              <BsSearch />
          </InputGroup.Text>
          <Form.Control
              placeholder="이름, 아이디 (나중에 전화번호도 추가?)"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
          />
          </InputGroup>
      </div>

      {/* FRIEND LIST */}
      <div className="flex-grow-1 overflow-auto">
        <ListGroup variant="flush">
          {filteredFriends.map((friend) => (
            <ListGroup.Item
              key={friend.friendId}
              className="d-flex align-items-center py-3 border-bottom"
            >
              {/* Profile Icon */}
              <div
                className="d-flex justify-content-center align-items-center"
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  border: "2px solid black",
                  backgroundColor: "#fff",
                }}
              >
                <strong>{friend.name[0]}</strong>
              </div>

              {/* Name */}
              <div className="ms-3 flex-grow-1">{friend.name}</div>

              {/* Checkbox */}
              <Form.Check
                type="checkbox"
                checked={selectedFriends.includes(friend.friendId)}
                onChange={() => handleToggleFriend(friend.friendId)}
                style={{ transform: "scale(1.3)" }}
              />
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>

      {/* BOTTOM BUTTON */}
      <Row className="p-4 border-top">
        <Button
          variant="dark"
          disabled={selectedFriends.length === 0}
          onClick={handleCreateChat}
          className="w-100 py-3"
        >
          채팅방 만들기
        </Button>
      </Row>
    </Container>
  );
};

export default CreateChatRoom;
