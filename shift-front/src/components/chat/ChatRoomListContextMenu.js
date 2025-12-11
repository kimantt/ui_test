import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useRef,
} from "react";
import { Form, Button } from "react-bootstrap";
import { useDispatch } from "react-redux";


import httpClient from "../../api/httpClient";
import { removeRoom } from "../../store/chatSlice";

const ChatRoomListContextMenu = forwardRef(({ rooms, setRooms }, ref) => {
  const dispatch = useDispatch();

  const [contextMenu, setContextMenu] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const [editingRoom, setEditingRoom] = useState(null);
  const [newRoomName, setNewRoomName] = useState("");
  const menuRef = useRef(null);

  // 부모가 사용할 메서드
  useImperativeHandle(ref, () => ({
    openContextMenu: (e, room) => {
      e.preventDefault();
      e.stopPropagation();

      setContextMenu({
        x: e.pageX,
        y: e.pageY,
        room,
      });
    },
  }));

  // 컨텍스트 메뉴가 열린 상태에서 바깥 영역 클릭이나 스크롤 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextMenu && menuRef.current && !menuRef.current.contains(e.target)) {
        setContextMenu(null);
      }
    };

    const handleScroll = () => {
      if (contextMenu) {
        setContextMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, [contextMenu]);

  // 채팅방 이름 저장
  const saveRoomName = () => {
    setRooms((prev) =>
      prev.map((r) =>
        r.chatroomId === editingRoom.chatroomId
          ? { ...r, chatroomName: newRoomName }
          : r
      )
    );
    setShowEditModal(false);
  };

  // 채팅방 나가기 실행
  const confirmLeaveRoom = async () => {
    const r = editingRoom;
    if (!r) return;

    try {
      // 채팅방 삭제 요청
      await httpClient.delete(`/chatrooms/users/${r.chatroomUserId}`);
      // 프론트에서 제거
      dispatch(removeRoom(r.chatroomId));
      setRooms((prev) => prev.filter((room) => room.chatroomId !== r.chatroomId));

    } catch (err) {
      alert("채팅방을 삭제하지 못했습니다.");
    }

    setShowLeaveModal(false);
    setEditingRoom(null);
  };

  return (
    <>
      {/* 우클릭 메뉴 */}
      {contextMenu && (
        <div
          className="position-fixed bg-white border shadow"
          ref={menuRef}
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
            padding: "8px 0",
            width: "150px",
            zIndex: 9999,
            borderRadius: "6px",
          }}
        >
          {/* 이름 수정 */}
          <div
            className="px-3 py-2"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setEditingRoom(contextMenu.room);
              setNewRoomName(contextMenu.room.chatroomName);
              setShowEditModal(true);
              setContextMenu(null);
            }}
          >
            이름 수정
          </div>

          {/* 채팅방 나가기 */}
          <div
            className="px-3 py-2 text-danger"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setEditingRoom(contextMenu.room);
              setShowLeaveModal(true); // 확인 모달 띄우기
              setContextMenu(null); // Context Menu 닫기
            }}
          >
            채팅방 나가기
          </div>
        </div>
      )}

      {/* 이름 수정 모달 */}
      {showEditModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.4)", zIndex: 9998 }}
        >
          <div
            className="bg-white p-4 rounded shadow"
            style={{ width: "80%", maxWidth: 350 }}
          >
            <h5 className="mb-3">채팅방 이름 수정</h5>

            <Form.Control
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              className="mb-3"
            />

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                취소
              </Button>
              <Button variant="dark" onClick={saveRoomName}>
                저장
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 채팅방 나가기 확인 모달 */}
      {showLeaveModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.4)", zIndex: 9998 }}
        >
          <div
            className="bg-white p-4 rounded shadow"
            style={{ width: "80%", maxWidth: 350 }}
          >
            <h5 className="mb-3 text-danger">채팅방 나가기</h5>

            <p>이 채팅방에서 나가시겠습니까?</p>

            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button
                variant="secondary"
                onClick={() => setShowLeaveModal(false)}
              >
                취소
              </Button>

              <Button variant="danger" onClick={confirmLeaveRoom}>
                나가기
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default ChatRoomListContextMenu;
