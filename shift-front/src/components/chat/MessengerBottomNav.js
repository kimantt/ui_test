import React from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { TotalUnread } from "../../store/chatSlice";

const MessengerBottomNav = ({ active }) => {
  const navigate = useNavigate();

  const totalUnread = useSelector(TotalUnread);

  // 현재 탭이면 onClick 없애기
  const getProps = (page, path) => {
    if (active === page) {
      return {
        variant: "link",
        className: "text-dark fw-bold text-decoration-none",
        style: { cursor: "default" }, // 커서 변경 X
        onClick: null,                // 클릭 이벤트 제거
        disabled: true                // Bootstrap 비활성화
      };
    }

    return {
      variant: "link",
      className: "text-secondary text-decoration-none",
      onClick: () => navigate(path)
    };
  };

  return (
    <div className="border-top p-3 d-flex justify-content-around bg-white">
      <Button {...getProps("friends", "/friends")}>친구</Button>

      <div className="position-relative">
        <Button {...getProps("chat", "/chatroom/list")}>
          채팅
        </Button>

        {/* totalUnread가 0보다 크면 뱃지 표시 */}
        {totalUnread > 0 && (
          <span
            style={{
              position: "absolute",
              right: -10,
              top: -12,
              padding: "2px 8px",
              backgroundColor: "red",
              color: "white",
              fontSize: "0.75rem",
              borderRadius: "999px",
              whiteSpace: "nowrap",
            }}
          >
            {totalUnread}
          </span>
        )}
      </div>

      <Button {...getProps("shop", "/shop")}>쇼핑</Button>
      <Button {...getProps("chatroom/mypage", "/chatroom/mypage")}>MY</Button>
    </div>
  );
};

export default MessengerBottomNav;
