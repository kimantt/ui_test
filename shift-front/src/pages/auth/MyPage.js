import React, { useEffect, useState, useCallback } from "react";
import {
  Container,
  Button,
  Card,
  Tabs,
  Tab,
  Badge,
  Spinner,
} from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

import {
  getMyInfo,
  updateUserInfo,
  checkPhoneDuplicate,
} from "../../api/userApi";

import { getOrders } from "../../api/orderApi";
import { logoutUser } from "../../api/authApi";
import { logout } from "../../store/authSlice";

import EditableUserInfoCard from "../../components/user/UserFieldEditor";
import MyReviewTab from "../../components/mypage/MyReviewTab";
import GiftListTab from "../../components/gift/GiftListTab";
import MyPointTab from "../../components/mypage/MyPointTab";
import MainLayout from "../../components/common/MainLayout";

import {
  validateName,
  validatePhone,
  formatPhoneNumber,
} from "../../utils/signUpValidation";

const MyPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const location = useLocation();
  const initialTab = location.state?.activeTab ?? "profile";
  const [activeTab, setActiveTab] = useState(initialTab);

  const [user, setUser] = useState({});
  const [userLoading, setUserLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  /** 전체 데이터 로드 */
  useEffect(() => {
    loadMyPage();
  }, []);

  const loadMyPage = async () => {
    setUserLoading(true);
    setOrdersLoading(true);

    try {
      // 사용자 정보
      const userData = await getMyInfo();
      setUser(userData);

      // 주문 목록
      const ordersRes = await getOrders();
      setOrders(ordersRes.orders || []);
    } finally {
      setUserLoading(false);
      setOrdersLoading(false);
    }
  };

  /** 사용자 정보 변경 */
  const handleUpdateUserField = useCallback(
    async (field, newValue) => {
      let errorMsg = "";

      if (field === "name") {
        errorMsg = validateName(newValue);
      } else if (field === "phone") {
        const formatted = formatPhoneNumber(newValue);
        errorMsg = validatePhone(formatted);

        if (!errorMsg) {
          const cleaned = formatted.replace(/-/g, "");
          if (cleaned !== user.phone?.replace(/-/g, "")) {
            const isDup = await checkPhoneDuplicate(cleaned);
            if (isDup) throw new Error("이미 사용 중인 전화번호입니다.");
          }
        }
      }

      if (errorMsg) throw new Error(errorMsg);

      const updatedUser = await updateUserInfo({
        ...user,
        [field]:
          field === "phone"
            ? formatPhoneNumber(newValue).replace(/-/g, "")
            : newValue,
      });

      setUser(updatedUser);
    },
    [user]
  );

  const handleLogout = async () => {
    if (!window.confirm("정말 로그아웃 하시겠습니까?")) return;
    await logoutUser();
    dispatch(logout());
    navigate("/");
  };

  const formatNumber = (n) => Number(n).toLocaleString();

  const getOrderStatusText = (order) => {
    switch (order.orderStatus) {
      case "PAID":
      case "S":
        return "결제완료";
      case "CANCELED":
      case "C":
        return "취소완료";
      case "COMPLETED":
      case "D":
        return "구매확정";
      default:
        return "결제대기";
    }
  };

  return (
    <MainLayout maxWidth="800px">
      <Container className="py-5">
        <h2 className="fw-bold mb-4">마이 페이지</h2>

        <Tabs
          activeKey={activeTab}
          onSelect={setActiveTab}
          className="mb-4 border-bottom"
          justify
        >
          {/* 개인정보 */}
          <Tab eventKey="profile" title="개인정보 확인/수정">
            <div className="d-flex flex-column gap-3 pt-3">

              <Card className="border bg-light shadow-sm">
                <Card.Body className="p-4">
                  <div className="text-muted small mb-1">ID</div>
                  <div className="fw-medium">{user.loginId}</div>
                </Card.Body>
              </Card>

              <EditableUserInfoCard
                title="이름"
                initialValue={user.name}
                inputHelperText="이름은 2~6자 한글만 가능"
                onSave={(v) => handleUpdateUserField("name", v)}
              />

              <EditableUserInfoCard
                title="연락처"
                initialValue={user.phone}
                inputHelperText="11자리 숫자 입력"
                inputType="tel"
                onSave={(v) => handleUpdateUserField("phone", v)}
              />

              <Card className="border bg-light shadow-sm">
                <Card.Body className="p-4">
                  <div className="text-muted small mb-1">주소</div>
                  <div className="fw-medium">{user.address}</div>
                </Card.Body>
              </Card>

              <div className="pt-3 border-top d-flex justify-content-between">
                <Button variant="link" className="text-muted p-0 small" onClick={handleLogout}>
                  로그아웃
                </Button>
                
                {/* 오른쪽 끝: 회원탈퇴 */}
                <Button
                  variant="link"
                  className="text-secondary text-decoration-underline p-0 small"
                  onClick={() => navigate('/user/withdrawal')}
                >
                  회원탈퇴
                </Button>
              </div>
            </div>
          </Tab>

          {/* 포인트 */}
          <Tab eventKey="points" title="포인트 확인">
            <MyPointTab />
          </Tab>

          {/* 리뷰 */}
          <Tab eventKey="reviews" title="리뷰">
            <MyReviewTab />
          </Tab>

          {/* 선물함 */}
          <Tab eventKey="gifts" title="선물함">
            <GiftListTab />
          </Tab>

          {/* 주문목록 */}
          <Tab eventKey="orders" title="주문목록">
            <div className="pt-3 d-flex flex-column gap-3">
              {!ordersLoading &&
                orders.map((order) => (
                  <Card
                    key={order.orderId}
                    className="border shadow-sm"
                    role="button"
                    onClick={() => navigate(`/orders/${order.orderId}`)}
                  >
                    <Card.Body className="p-4">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted small">{order.orderDate}</span>
                        <Badge bg="light" text="dark" className="border fw-normal">
                          {getOrderStatusText(order)}
                        </Badge>
                      </div>

                      <div className="d-flex justify-content-between mb-2">
                        <div>
                          <div className="text-muted small mb-1">받는 사람</div>
                          <div className="fw-bold">
                            {order.receiverName ?? `ID ${order.receiverId}`}
                          </div>
                        </div>

                        <div className="text-end">
                          <div className="text-muted small mb-1">주문번호</div>
                          <div className="fw-bold">#{order.orderId}</div>
                        </div>
                      </div>

                      <div className="d-flex justify-content-between mt-3">
                        <span className="text-muted small">총 결제 금액</span>
                        <span className="fw-bold">{formatNumber(order.totalPrice)}원</span>
                      </div>

                      <div className="text-end mt-3 small text-secondary">상세보기 &gt;</div>
                    </Card.Body>
                  </Card>
                ))}
            </div>
          </Tab>
        </Tabs>
      </Container>
    </MainLayout>
  );
};

export default MyPage;