import React, { useState } from "react";
import { Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { PROFILE_DEFAULT } from "../../utils/chatImages";

// 선물 메시지 UI 포맷
const GiftMessageWrapper = ({ msg, userId, time, showSender, displayName }) => {
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState(`https://shift-main-images.s3.ap-northeast-3.amazonaws.com/user_profile/${msg.userId}.png`);

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
  const giftType = extractGiftType(msg.content);

  const handleClick = () => {
    if (isMine) {
      navigate(`/orders/${extractedId}`, {
        state: { giftType }
      }); // 주문 상세
    } else {
      navigate(`/gifts/${extractedId}`, {
        state: { giftType }
      });  // 선물함
    }
  };

  // 주문번호 제거된 메시지 추출
  const getDisplayContent = (content) => {
    const parts = content.split("&");
    const baseMessage =
      parts.length >= 3 ? parts.slice(0, parts.length - 2).join("&").trim() : content;
    const baseMessageLines = baseMessage.split("\n");
    const amountText = baseMessageLines.slice(1).join("\n").trim();

    const giftLabel = giftType === "POINT" ? "금액권 선물" : "선물";
    const giftIcon = giftType === "POINT" ? "💳" : "🎁";

    if (giftType) {
      const particle = isMine ? "을" : "이";
      const verb = isMine ? "보냈습니다." : "도착했습니다!";
      const lines = [`${giftIcon} ${giftLabel}${particle} ${verb}`];

      if (giftType === "POINT" && amountText) {
        lines.push(amountText);
      }

      return lines.join("\n");
    }
    return baseMessage; // 메시지 형식이 다를 경우 그대로 반환
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
    alignItems: isMine ? "flex-end" : "flex-start",
    gap: "6px",
    marginBottom: "5px",
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
        <Card
          style={{
            maxWidth: "260px",
            border: "2px solid #ddd",
            borderRadius: "10px",
            padding: "12px",
            textAlign: "center",
          }}
        >
          <img
            src="https://shift-main-images.s3.ap-northeast-3.amazonaws.com/gift_message.png"
            alt="Gift"
            style={{
              width: "100%",
              aspectRatio: "3 / 2",
              objectFit: "cover",
              borderRadius: "8px",
              marginBottom: "10px",
            }}
          />

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
