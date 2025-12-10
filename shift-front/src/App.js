import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

// layout
import DevNavigation from "./components/layout/DevNavigation";
//common
import ShopHeader from "./components/common/ShopHeader";

// auth
import Login from "./pages/auth/LoginPage";
import MyPage from "./pages/auth/MyPage";
import SignUp from "./pages/user/signUp";

// chat
import FriendList from "./pages/chat/FriendList";
import ChatRoomList from "./pages/chat/ChatRoomList";
import ChatRoom from "./pages/chat/ChatRoom";
import CreateChatRoom from "./pages/chat/CreateChatRoom";
import NewChatRoom from "./pages/chat/NewChatRoom";
import UserSearch from "./pages/chat/UserSearch";
import ChatMyPage from "./pages/chat/ChatMyPage";

// shop
import ShopMain from "./pages/shop/ShopMain"; // 홈(배너+추천상품)
import ProductList from "./pages/shop/ProductList"; // 전체상품/카테고리상품
import ProductDetail from "./pages/shop/ProductDetail"; // 상품상세
import ProductSearch from "./pages/shop/ProductSearch"; // 상품검색
import Cart from "./pages/shop/Cart";
import GiftCard from "./pages/shop/GiftCard";
import Checkout from "./pages/shop/Checkout";
import ReceiverSelection from "./pages/shop/ReceiverSelection";
import ReceiverCheckout from "./pages/shop/ReceiverCheckout";
import CheckoutComplete from "./pages/shop/CheckoutComplete";
import GiftReceiverSelect from "./pages/shop/GiftReceiverSelect";
import OrderDetail from "./pages/shop/OrderDetail"; // ← 추가
import ReviewCreate from "./pages/shop/ReviewCreate"; // 리뷰 작성
import ReviewEdit from "./pages/shop/ReviewEdit"; // 리뷰 수정
import GiftDetail from "./pages/shop/GiftDetail";

import { useDispatch } from "react-redux";
import { loginSuccess } from "./store/authSlice";
import { storage } from "./utils/storage";
import { StompProvider } from "./api/StompProvider";
import WithdrawalPage from "./pages/user/WithdrawalPage";

function App() {
  const dispatch = useDispatch();

  // 앱 시작 시 로컬스토리지에 토큰이 있으면 Redux 상태 업데이트
  useEffect(() => {
    const token = storage.getToken();
    if (token) {
      dispatch(loginSuccess({ accessToken: token }));
    }

    // 다른 탭에서 localStorage 변경 감지
    const handleStorageChange = (e) => {
      if (e.key === "accessToken") {
        // 로그아웃 감지
        if (!e.newValue) {
          window.location.reload();
          return;
        } // 액세스 토큰 변경 감지

        const oldUserId = storage.getUserId(e.oldValue);
        const newUserId = storage.getUserId(e.newValue);

        if (oldUserId === newUserId) {
          window.location.reload();
        } else {
          alert("다른 탭에서 계정이 변경되었습니다. 페이지를 새로고침합니다.");
          window.location.reload();
        }
      }
    };

    // storage 이벤트 리스너 등록
    window.addEventListener("storage", handleStorageChange);

    // 리스너 해제
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [dispatch]);

  return (
    <div>
      <DevNavigation />

      <div style={{ marginTop: "60px" }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/friends" element={<FriendList />} />
          <Route path="/chatroom/list" element={<ChatRoomList />} />
          <Route path="/chatroom/:chatroomId" element={<ChatRoom />} />
          <Route path="/chatroom/create" element={<CreateChatRoom />} />
          <Route path="/chatroom/new" element={<NewChatRoom />} />
          <Route path="/userSearch" element={<UserSearch />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/chatroom/mypage" element={<ChatMyPage />} />

          <Route path="/signup" element={<SignUp />} />

          {/* 홈 페이지 (배너 + 추천상품) */}
          <Route path="/shop" element={<ShopMain />} />

          {/* 전체상품 페이지 */}
          <Route path="/shop/products" element={<ProductList />} />

          {/* 카테고리별 상품 페이지 */}
          <Route path="/category/:categoryId" element={<ProductList />} />

          {/* 상품 검색 페이지 */}
          <Route path="/shop/search" element={<ProductSearch />} />

          {/* 상품 상세 */}
          <Route path="/product/:productId" element={<ProductDetail />} />

          {/* 선물 상세 페이지 */}
          <Route path="/gifts/:giftId" element={<GiftDetail />} />

          <Route path="/cart" element={<Cart />} />
          <Route path="/gift-card" element={<GiftCard />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/receiver/select" element={<ReceiverSelection />} />
          <Route path="/receiver/checkout" element={<ReceiverCheckout />} />

          {/* 주문/결제 완료 페이지 */}
          <Route
            path="/checkout/complete/:orderId"
            element={<CheckoutComplete />}
          />
          <Route
            path="/gift/select-receiver"
            element={<GiftReceiverSelect />}
          />
          <Route
            path="/gift/select-receiver"
            element={<GiftReceiverSelect />}
          />

          {/* 주문 상세 페이지 */}
          <Route path="/orders/:orderId" element={<OrderDetail />} />

          {/* 리뷰 작성/수정/삭제 페이지 */}
          <Route path="/review/create" element={<ReviewCreate />} />
          <Route path="/review/edit" element={<ReviewEdit />} />

          {/* 회원 탈퇴 페이지 */}
          <Route path="/user/withdrawal" element={<WithdrawalPage />} />

          {/* 404: 잘못된 경로 → 홈으로 */}
          <Route path="*" element={<ShopMain />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
