import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/authSlice";
import { logoutUser } from "../../api/authApi";
import { TotalUnread } from "../../store/chatSlice";

const MessengerSidebar = ({ active }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const totalUnread = useSelector(TotalUnread);

  const handleLogout = async () => {
    await logoutUser();
    dispatch(logout());
    navigate("/");
  };

  const navItems = [
    { key: "friends", label: "친구 목록", path: "/friends" },
    { key: "chat", label: "채팅방", path: "/chatroom/list", badge: totalUnread },
    { key: "shop", label: "쇼핑", path: "/shop" },
    { key: "chatroom/mypage", label: "MY", path: "/chatroom/mypage" },
  ];

  return (
    <aside className="messenger-sidebar shadow-sm">
      <div>
        <div className="sidebar-title mb-2">My Messenger</div>
        <p className="mb-0 text-white-50 small">메신저 메뉴</p>
      </div>

      <div className="d-flex flex-column gap-2">
        {navItems.map((item) => (
          <button
            key={item.key}
            className={`messenger-nav-button ${active === item.key ? "active" : ""}`}
            onClick={() => navigate(item.path)}
          >
            <span>{item.label}</span>
            {item.badge > 0 && <span className="badge-count">{item.badge}</span>}
          </button>
        ))}
      </div>

      <div className="sidebar-footer">
        <button className="messenger-nav-button logout w-100" onClick={handleLogout}>
          로그아웃
        </button>
      </div>
    </aside>
  );
};

export default MessengerSidebar;
