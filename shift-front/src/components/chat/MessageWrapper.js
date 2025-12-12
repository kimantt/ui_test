import React, { useState } from "react";
import { PROFILE_DEFAULT } from "../../utils/chatImages";

// 일반 메시지 UI 포맷
const MessageWrapper = ({ msg, userId, time, showSender, displayName }) => {
  const isMine = msg.userId === userId;
  const [avatarSrc, setAvatarSrc] = useState(`https://shift-main-images.s3.ap-northeast-3.amazonaws.com/user_profile/${msg.userId}.png`);

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: isMine ? "flex-end" : "flex-start",
    gap: "6px",
    marginBottom: "3px",
  };

  const senderStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const avatarStyle = {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    border: "1px solid #ddd",
  };

  const nameStyle = {
    fontWeight: "bold",
    fontSize: "18px",
  };

  const messageRowStyle = {
    display: "flex",
    alignItems: "flex-end",
    gap: "8px",
    maxWidth: "75%",
    flexDirection: isMine ? "row-reverse" : "row",
  };

  const bubbleStyle = {
    padding: "10px 14px",
    borderRadius: "16px",
    backgroundColor: isMine ? "#5b8fc3" : "white",
    color: isMine ? "white" : "black",
    border: "2px solid #ddd",
  };

  const badgeStyle = {
    color: "gray",
    fontSize: "12px",
    padding: "2px 6px",
    borderRadius: "999px",
    whiteSpace: "nowrap",
    height: "fit-content",
    fontWeight: "bold",
  };

  const timeStyle = {
    color: "#6c757d",
    fontSize: "12px",
    alignSelf: isMine ? "flex-end" : "flex-start",
  };

  return (
    <div style={containerStyle}>
      {showSender && !isMine && (
        <div style={senderStyle}>
          <img
            src={avatarSrc}
            alt={`${displayName} 프로필`}
            style={avatarStyle}
            onError={() => setAvatarSrc(PROFILE_DEFAULT)}
          />
          <span style={nameStyle}>{displayName}</span>
        </div>
      )}

      <div style={messageRowStyle}>
        <div style={bubbleStyle}>{msg.content}</div>
        {msg.unreadCount > 0 && <span style={badgeStyle}>{msg.unreadCount}</span>}
      </div>

      <div className="text-muted small" style={timeStyle}>
        {time}
      </div>
    </div>
  );
};

export default MessageWrapper;
