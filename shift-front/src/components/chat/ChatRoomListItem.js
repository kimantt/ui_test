import React from "react";
import { ListGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const ChatRoomListItem = ({ room, menuRef, formatLastChatDate, getDisplayContent, onSelect }) => {
  const navigate = useNavigate();

  // 상대방 이름 정리
  const cleanName = (name) =>
    name
      ?.replace(/님과의 채팅방$/, "")
      ?.replace(/과의 채팅방$/, "")
      ?.replace(/와의 채팅방$/, "")
      ?.trim();

  const receiverId =
    room.friendId ??
    room.targetUserId ??
    null;

  const receiverName =
    room.friendName ??
    cleanName(room.chatroomName) ??
    "선물받는 친구";

  return (
    <ListGroup.Item
      key={`${room.chatroomUserId}-${room.chatroomId}`}
      action
      onContextMenu={(e) => menuRef?.current?.openContextMenu(e, room)}
      onClick={() => {
        const payload = {
          ...room,
          receiverId,
          receiverName,
        };

        if (onSelect) {
          onSelect(payload);
          return;
        }

        navigate(`/chatroom/${room.chatroomId}`, {
          state: { room: payload },
        });
      }}
      className="d-flex align-items-center gap-3 border-bottom py-3"
      style={{ cursor: "pointer" }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          border: "2px solid black",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span className="fw-bold">{room.chatroomName[0]}</span>
      </div>

      {/* Chat Info */}
      <div className="flex-grow-1 text-start">
        <div className="d-flex justify-content-between">
          <span className="fw-semibold">{room.chatroomName}</span>

          {room.lastMsgDate && (
            <span className="text-muted small">
              {formatLastChatDate(room.lastMsgDate)}
            </span>
          )}
        </div>

        <div className="d-flex justify-content-between align-items-center mt-1 position-relative">
          {/* 메시지 내용 */}
          {(room.lastMsgContent || room.message) ? (
            <div
              className="text-muted text-truncate small"
              style={{ maxWidth: "70%" }}
            >
              {getDisplayContent(room.lastMsgContent || room.message).length > 20
                ? getDisplayContent(room.lastMsgContent || room.message).slice(0, 17) + "..."
                : getDisplayContent(room.lastMsgContent || room.message)}
            </div>
          ) : (
            <div style={{ maxWidth: "70%" }}></div>
          )}

          {/* Unread count */}
          {room.unreadCount > 0 && (
            <span
              className="small rounded-pill"
              style={{
                position: "absolute",
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                padding: "2px 8px",
                backgroundColor: "red",
                color: "white",
                whiteSpace: "nowrap",
                fontSize: "0.75rem",
                borderRadius: "999px",
              }}
            >
              {room.unreadCount}
            </span>
          )}
        </div>
      </div>
    </ListGroup.Item>
  );
};

export default ChatRoomListItem;
