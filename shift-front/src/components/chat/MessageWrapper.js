import React from "react";

// 일반 메시지 UI 포맷
const MessageWrapper = ({ msg, userId, time, showSender, displayName }) => {
  const isMine = msg.userId === userId;
  const senderInitial = displayName?.[0]?.toUpperCase() || "?";

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "6px",
    marginBottom: "3px",
  };

  const senderStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const avatarStyle = {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "#f0f0f0",
    color: "#333",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    border: "1px solid #ddd",
  };

  const nameStyle = {
    fontWeight: "bold",
    fontSize: "14px",
  };

  const messageRowStyle = {
    display: "flex",
    alignItems: "flex-end",
    gap: "8px",
    maxWidth: "75%",
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
  };

  return (
    <div style={containerStyle}>
      {showSender && (
        <div style={senderStyle}>
          <div style={avatarStyle}>{senderInitial}</div>
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
