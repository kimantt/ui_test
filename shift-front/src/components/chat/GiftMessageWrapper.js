import React from "react";
import { Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

// 선물 메시지 UI 포맷
const GiftMessageWrapper = ({ msg, userId, time }) => {
  const navigate = useNavigate();

  const isMine = msg.userId === userId;

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
    <div style={rowStyle}>
      <div style={innerStyle}>
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
            variant="dark"
            onClick={handleClick}
            className="w-100"
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
