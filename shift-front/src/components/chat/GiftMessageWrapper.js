import React, { useState } from "react";
import { Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

// 선물 메시지 UI 포맷
const GiftMessageWrapper = ({ msg, userId, time, showSender, displayName }) => {
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(false);

  const isMine = msg.userId === userId;
  const senderInitial = displayName?.[0]?.toUpperCase() || "?";

  // msg.content에서 주문번호 추출
  const extractIdFromContent = (content) => {
    const parts = content.split("&");
    return parts.length >= 2 ? parts[parts.length - 2] : null;
  };
  const extractedId = extractIdFromContent(msg.content);

  // msg.content에서 선물 타입 추출
  const extractGiftType = (content) => {
    const parts = content.split("&");
    return parts.length >= 3 ? parts[parts.length - 1] : null;
  };

  const handleClick = () => {
    if (isMine) {
      navigate(`/orders/${extractedId}`, {
        state: { giftType: extractGiftType(msg.content) }
      }); // 주문 상세
    } else {
      navigate(`/gifts/${extractedId}`, {
        state: { giftType: extractGiftType(msg.content) }
      });  // 선물함
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

  const getButtonStyle = () => {
    if (isMine) {
      return {
        backgroundColor: isHovering ? "#4a78b5" : "#5b8fc3",
        borderColor: isHovering ? "#4a78b5" : "#5b8fc3",
        color: "white",
        transition: "all 0.2s ease",
      };
    }

    return {
      backgroundColor: isHovering ? "#d7e6f7" : "#EAF2FB",
      borderColor: isHovering ? "#4a78b5" : "#5b8fc3",
      color: isHovering ? "#4a78b5" : "#5b8fc3",
      transition: "all 0.2s ease",
    };
  };

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "6px",
    marginBottom: "5px",
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
    <div style={containerStyle}>
      {showSender && (
        <div style={senderStyle}>
          <div style={avatarStyle}>{senderInitial}</div>
          <span style={nameStyle}>{displayName}</span>
        </div>
      )}

      <div style={messageRowStyle}>
        <Card
          style={{
            maxWidth: "260px",
            border: "2px solid #ddd",
            borderRadius: "10px",
            padding: "12px",
            textAlign: "center",
          }}
        >
          <p className="small text-muted mb-2" style={{ whiteSpace: "pre-line" }}>
            {getDisplayContent(msg.content)}
          </p>

          <Button
            onClick={handleClick}
            className="w-100"
            style={getButtonStyle()}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {isMine ? "주문 상세" : "선물함"}
          </Button>

          <p className="text-muted small mt-2">{time}</p>
        </Card>

        {msg.unreadCount > 0 && <span style={badgeStyle}>{msg.unreadCount}</span>}
      </div>
    </div>
  );
};

export default GiftMessageWrapper;
