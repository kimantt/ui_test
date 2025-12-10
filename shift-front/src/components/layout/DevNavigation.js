import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { logoutUser } from "../../api/authApi";
import { logout } from "../../store/authSlice";
import { storage } from "../../utils/storage";
import store from "../../store/store";

const DevNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const btnStyle = "btn btn-sm btn-light text-nowrap";
  const outlineBtnStyle = "btn btn-sm btn-outline-light text-nowrap";

  return (
    <div
      className="fixed-top bg-dark p-2 d-flex gap-2 overflow-auto align-items-center shadow"
      style={{ zIndex: 9999, whiteSpace: "nowrap" }}
    >
      <span className="text-warning small fw-bold me-2">
        Current: {location.pathname}
      </span>

      {/* 회원/소셜 (Figma: Login, FriendList, ChatList, MyPage) */}
      <button className={btnStyle} onClick={() => navigate("/")}>
        로그인
      </button>
      <button className={btnStyle} onClick={async () => {
                                                    await logoutUser();
                                                    store.dispatch(logout());
                                                    navigate("/");
                                                  }}>
        로그아웃
      </button>
      <button className={btnStyle} onClick={() => navigate("/friends")}>
        친구목록
      </button>
      <button className={btnStyle} onClick={() => navigate("/chatroom/list")}>
        채팅목록
      </button>
      <button className={btnStyle} onClick={() => navigate("/mypage")}>
        마이페이지
      </button>

      <div className="vr bg-white mx-1 opacity-50"></div>

      {/* 쇼핑 (Figma: ShopMain, Cart, GiftCard, ProductDetail) */}
      <button className={outlineBtnStyle} onClick={() => navigate("/shop")}>
        쇼핑홈
      </button>
      <button className={outlineBtnStyle} onClick={() => navigate("/cart")}>
        장바구니
      </button>
      <button
        className={outlineBtnStyle}
        onClick={() => navigate("/gift-card")}
      >
        금액권
      </button>
      <button
        className={outlineBtnStyle}
        onClick={() => navigate("/product/detail")}
      >
        상품상세
      </button>

      <div className="vr bg-white mx-1 opacity-50"></div>

      {/* 결제/선물받기 (Figma: Checkout, ReceiverSelection, ReceiverCheckout) */}
      <button className={outlineBtnStyle} onClick={() => navigate("/checkout")}>
        결제하기
      </button>
      <button
        className={outlineBtnStyle}
        onClick={() => navigate("/receiver/select")}
      >
        선물받기(옵션)
      </button>
      <button
        className={outlineBtnStyle}
        onClick={() => navigate("/receiver/checkout")}
      >
        선물받기(배송)
      </button>
    </div>
  );
};

export default DevNavigation;
