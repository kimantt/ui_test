import React from "react";

// 일반 메시지 UI 포맷
const MessageWrapper = ({ msg, userId, time }) => {
  const isMine = msg.userId === userId;

  const rowStyle = {
    display: "flex",
    justifyContent: isMine ? "flex-end" : "flex-start",
    marginBottom: "6px",
  };

  const innerStyle = {
    display: "flex",
    flexDirection: isMine ? "row-reverse" : "row",
    alignItems: "flex-end",
    maxWidth: "75%",
  };

  const bubbleStyle = {
    padding: "10px 14px",
    borderRadius: "16px",
    backgroundColor: isMine ? "black" : "white",
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

  return (
    <>
      <div style={rowStyle}>
        <div style={innerStyle}>
          <div style={bubbleStyle}>{msg.content}</div>
          {msg.unreadCount > 0 && <span style={badgeStyle}>{msg.unreadCount}</span>}
        </div>
      </div>

      <div
        className="text-muted small"
        style={{
          display: "flex",
          justifyContent: isMine ? "flex-end" : "flex-start",
          marginBottom: "10px",
        }}
      >
        {time}
      </div>
    </>
  );
};

export default MessageWrapper;
