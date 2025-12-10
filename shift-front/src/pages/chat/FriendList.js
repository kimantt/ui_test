import React, { useState, useEffect, useContext, useRef  } from "react";
import { ListGroup, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";

import { StompContext } from "../../api/StompProvider";
import httpClient from '../../api/httpClient';
import FriendListContextMenu from "../../components/chat/FriendListContextMenu";
import MessengerBottomNav from "../../components/chat/MessengerBottomNav";
import MessengerSidebar from "../../components/chat/MessengerSidebar";
import "../../styles/MessengerLayout.css";

const FriendListContent = ({ onSelectFriend, embedded }) => {
  const { stompReady } = useContext(StompContext);
  const navigate = useNavigate();

  const menuRef = useRef(null); // 우클릭 메뉴 참조

  // 친구 정보 리스트
  const [friendInfoList, setFriendInfoList] = useState([]);

  // 편집 모드 on/off
  const [editMode, setEditMode] = useState(false);
  // 체크된 친구 목록
  const [selectedFriends, setSelectedFriends] = useState([]);

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

  const accessToken = useSelector((state) => state.auth.accessToken);
  // 페이지 진입 시 실행
  useEffect(() => {
    if (!stompReady) return; // 연결 체크
    if (!accessToken) return; // 토큰 유무 체크

    const userId = accessToken ? jwtDecode(accessToken).sub : null;
    console.log("STOMP 연결 완료 → getFriendsList 실행");
    getFriendsList(userId);
  }, [stompReady]);

  // 선택된 친구들 삭제 요청
  const deleteSelectedFriends = async () => {
    if (selectedFriends.length == 0) return alert("삭제할 친구를 선택하세요.");

    if (!window.confirm("선택한 친구를 삭제하시겠습니까?")) return;

    try {
      // 서버에 삭제 요청
      for (const friendshipId of selectedFriends) {
        await httpClient.delete(`/friends/${friendshipId}`);
      }

      // 프론트에서도 제거
      setFriendInfoList((prev) =>
        prev.filter((f) => !selectedFriends.includes(f.friendshipId))
      );

      // 편집 모드 종료
      setSelectedFriends([]);
      setEditMode(false);

    } catch (err) {
      alert("친구 삭제에 실패했습니다.");
      console.error(err);
    }
  };

  return (
    <div className={`d-flex flex-column ${embedded ? "h-100" : "vh-100"}`}>
      <FriendListContextMenu ref={menuRef} />
      <div className="px-4 py-4 border-bottom bg-white">
        <div className="d-flex align-items-center justify-content-between mb-1">
          <h2 className="fw-bold m-0">친구목록</h2>
          {/* 편집 모드에 따라 다르게 출력 */}
          {!onSelectFriend ? (
            !editMode ? (
              <div className="d-flex gap-2">
                <Button
                  variant="link"
                  className="text-secondary text-decoration-none p-0 small"
                  onClick={() => setEditMode(true)}
                >
                  편집
                </Button>
                <Button
                  variant="link"
                  className="text-secondary text-decoration-none p-0 small"
                  onClick={() => navigate("/userSearch")}
                >
                  친구 추가
                </Button>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Button
                  variant="link"
                  className="text-secondary text-decoration-none p-0 small"
                  onClick={() => {
                    setEditMode(false);
                    setSelectedFriends([]);
                  }}
                >
                  취소
                </Button>
  
                <Button
                  variant="link"
                  className="text-danger text-decoration-none p-0 small"
                  onClick={deleteSelectedFriends}
                >
                  삭제
                </Button>
              </div>
            )
          ) : null}
        </div>
      </div>

      <div className="px-4 py-3 bg-light border-bottom">
        <span className="small text-secondary">친구 {friendInfoList.length}</span>
      </div>

      <ListGroup variant="flush" className="flex-grow-1 overflow-auto">
        {friendInfoList.map((friend) => (
          <ListGroup.Item
            key={friend.friendId}
            action
            onContextMenu={(e) => menuRef.current?.openContextMenu(e, friend)} // 우클릭 시 메뉴 열기
            className="d-flex align-items-center border-0 px-4 py-3"
            onClick={() => {
                if (!editMode) {
                  if (onSelectFriend) {
                    onSelectFriend(friend); // 선물하기-> 리시버 선택 모드일 때
                  } else {
                    //navigate("chat-room"); // 채팅방으로 이동 (데모)
                  }
                } 
                else {
                  // 체크박스 체크
                  setSelectedFriends((prev) =>
                    prev.includes(friend.friendshipId)
                      ? prev.filter((friendshipId) => friendshipId !== friend.friendshipId)
                      : [...prev, friend.friendshipId]
                  );
                }
              } 
            }
          >
            {/* Profile Icon */}
            <div
              className="rounded-circle border border-2 border-dark d-flex align-items-center justify-content-center flex-shrink-0 me-3"
              style={{ width: "48px", height: "48px" }}
            >
              <span className="fw-bold">{friend.name[0]}</span>
            </div>

            {/* Name */}
            <span className="fw-bold">{friend.name}</span>

            {/* 편집 모드일 때 체크박스 표시 */}
            {editMode && (
              <div
                style={{
                  marginLeft: "auto",
                  width: "22px",
                  height: "22px",
                  pointerEvents: "none", // 클릭 막고 부모만 클릭됨
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedFriends.includes(friend.friendshipId)}
                  readOnly
                  style={{
                    width: "22px",
                    height: "22px",
                    cursor: "pointer",
                  }}
                />
              </div>
            )}
          </ListGroup.Item>
        ))}
      </ListGroup>

      {!embedded && !onSelectFriend ? <MessengerBottomNav active="friends" /> : null}
    </div>
  );
};

const FriendList = (props) => {
  if (props.embedded) {
    return <FriendListContent {...props} embedded />;
  }

  return (
    <div className="messenger-layout">
      <MessengerSidebar active="friends" />

      <div className="messenger-column list-column">
        <FriendListContent {...props} embedded />
      </div>

      <div className="messenger-column detail-column">
        <div className="messenger-placeholder">
          채팅방을 선택하면 대화가 이곳에 표시됩니다.
        </div>
      </div>
    </div>
  );
};

export default FriendList;
