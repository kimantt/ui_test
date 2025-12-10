import React, { useEffect, useState } from "react";
import { Container, Button, Form, Row, Col, Card } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import MainLayout from "../../components/common/MainLayout";
import FixedBottomButton from "../../components/common/FixedBottomButton";
import RefundNoticeModal from "../../components/gift/RefundNoticeModal";
import { POINT_IMG } from "../../utils/productImages";

const GiftCard = ({ onNavigate }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [customAmount, setCustomAmount] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [showRefundModal, setShowRefundModal] = useState(false);

  /** -------------------------------------------------------
   * ② 수신자 정보 (state → window fallback)
   * ------------------------------------------------------- */
  const receiverId =
    location.state?.receiverId ??
    (typeof window !== "undefined" ? window.SHIFT_RECEIVER_ID : null) ??
    null;

  const receiverName =
    location.state?.receiverName ??
    (typeof window !== "undefined" ? window.SHIFT_RECEIVER_NAME : null) ??
    "선물받는 친구";

  /** -------------------------------------------------------
   * ① 채팅 플로우 판별 (Redux + state 둘 다 체크)
   * ------------------------------------------------------- */
  const chatroomIdFromRedux = useSelector(
    (state) => state.chat?.currentRoomId ?? null
  );
  const chatroomIdFromState = location.state?.chatroomId ?? null;
  const chatroomId = chatroomIdFromRedux || chatroomIdFromState;

  const isChatGiftFlow = !!chatroomId || !!receiverId;

  /** -------------------------------------------------------
   * ③ GiftCard 진입 시 초기화 규칙
   *    ▶ 쇼핑몰 플로우일 때만 전역 수신자 초기화
   * ------------------------------------------------------- */
  useEffect(() => {
    if (!isChatGiftFlow && typeof window !== "undefined") {
      window.SHIFT_RECEIVER_ID = null;
      window.SHIFT_RECEIVER_NAME = null;
    }
  }, [isChatGiftFlow]);

  /** -------------------------------------------------------
   * 금액 입력
   * ------------------------------------------------------- */
  const quickAmounts = [
    { label: "+ 1천원", value: 1000 },
    { label: "+ 5천원", value: 5000 },
    { label: "+ 1만원", value: 10000 },
    { label: "+ 5만원", value: 50000 },
  ];

  const handleCustomInput = () => {
    const amount = parseInt(customAmount);
    if (!isNaN(amount) && amount > 0) {
      setTotalAmount((prev) => prev + amount);
      setCustomAmount("");
    }
  };
  // 금액권 선물하기 → Checkout 이동 핸들러
  const handleResetAmount = () => {
    setTotalAmount(0);
    setCustomAmount("");
  };

  /** -------------------------------------------------------
   * 선물하기 클릭 → 모달 오픈
   * ------------------------------------------------------- */
  const handleGoToCheckout = () => {
    if (totalAmount === 0) return;
    setShowRefundModal(true);
  };

  /** -------------------------------------------------------
   * 모달 "예" → 플로우별 이동
   * ------------------------------------------------------- */
  const confirmGoToCheckout = () => {
    setShowRefundModal(false);

    const VOUCHER_PRODUCT_ID = 49; 

    const items = [
      {
        productId: VOUCHER_PRODUCT_ID,
        name: "Shift 금액권",
        price: totalAmount,
        quantity: 1,
      },
    ];

    // ① 채팅 플로우 → 바로 Checkout
    if (isChatGiftFlow) {
      const payload = {
        items,
        isGift: true,
        isVoucherOrder: true,
        chatroomId,
        receiverId,
        receiverName,
      };


      console.log("금액권 선물하기 - Checkout 이동 페이로드", payload);
      if (onNavigate) {
        onNavigate("checkout", payload);
      } else {
        navigate("/checkout", { state: payload });
      }
      return;
    }

    // ② 쇼핑몰 플로우 → 친구 선택
    navigate("/gift/select-receiver", {
      state: {
        items,
        isGift: true,
        isVoucherOrder: true,
      },
    });
  };

  return (
    <>
      <MainLayout maxWidth="600px">
        <Container className="py-4">
          <h2 className="fw-bold mb-4">금액권 선물하기</h2>

          {/* 금액권 이미지 */}
          <Card className="mb-4 bg-light border text-center overflow-hidden">
            <Card.Img
              src={POINT_IMG}
              alt="금액권 이미지"
              style={{ maxHeight: "260px", objectFit: "cover" }}
            />
          </Card>

          {/* 금액 입력 */}
          <Form.Group className="mb-2">
            <Form.Label>금액을 입력하세요</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control
                type="number"
                placeholder="직접 입력"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
              />
              <Button variant="dark" onClick={handleCustomInput}>
                입력
              </Button>
            </div>
          </Form.Group>

          {/* 환불 안내 */}
          <div className="text-danger small mb-4">
            ※ 금액권은 구매 후 환불이 불가능합니다.
          </div>

          {/* 빠른 버튼 */}
          <Row className="g-2 mb-3">
            {quickAmounts.map((q) => (
              <Col xs={3} key={q.value}>
                <Button
                  variant="outline-secondary"
                  className="w-100 py-3"
                  onClick={() => setTotalAmount((p) => p + q.value)}
                >
                  {q.label}
                </Button>
              </Col>
            ))}
          </Row>

          {/* 금액 취소 */}
          <Button
            variant="outline-danger"
            className="w-100 mb-5"
            onClick={handleResetAmount}
          >
            금액 취소
          </Button>

          {/* 총 금액 */}
          <div className="bg-light p-4 rounded mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <span className="fs-5">총 선물 금액</span>
              <span className="fs-4 fw-bold text-primary">
                {totalAmount.toLocaleString()}원
              </span>
            </div>
          </div>
        </Container>
      </MainLayout>

      <FixedBottomButton width="600px">
        <Button
          variant="dark"
          className="w-100 py-3 fw-bold"
          size="lg"
          disabled={totalAmount === 0}
          onClick={handleGoToCheckout}
        >
          선물하기
        </Button>
      </FixedBottomButton>

      {/* 환불 안내 모달 */}
      <RefundNoticeModal
        show={showRefundModal}
        onCancel={() => setShowRefundModal(false)}
        onConfirm={confirmGoToCheckout}
      />
    </>
  );
};

export default GiftCard;
