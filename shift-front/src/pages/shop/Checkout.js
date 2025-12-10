import React, { useMemo, useState, useEffect } from "react";
import { Container, Button, Form, Card } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import MainLayout from "../../components/common/MainLayout";
import FixedBottomButton from "../../components/common/FixedBottomButton";

import {
  createOrder,
  requestPayment,
  createPointOrder,
  completePointOrder,
} from "../../api/orderApi";

import { requestPaymentAndGiftMessage, requestPaymentAndFirstGiftMessage } from "../../api/sendGiftMessage";
import { clearCartByUser } from "../../api/cartApi";
import { getMyInfo } from "../../api/userApi";
import { setCurrentRoomId } from "../../store/chatSlice";
import { resolveProductImage } from "../../utils/productImages";


const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const accessToken = useSelector((state) => state.auth.accessToken);

  /** 플래그 */
  const isGift = location.state?.isGift === true;
  const isVoucherOrder = location.state?.isVoucherOrder === true;

  /** 수령인 정보 */
  const receiverId =
    location.state?.receiverId ??
    (typeof window !== "undefined" ? window.SHIFT_RECEIVER_ID : null);

  const receiverName =
    location.state?.receiverName ??
    (typeof window !== "undefined" ? window.SHIFT_RECEIVER_NAME : null) ??
    "선물받는 친구";

  const chatroomId = useSelector((state) => state.chat?.currentRoomId ?? null);

  /** 주문상품 */
  const initialItems = location.state?.items || [];

  const fallbackItems = [
    { id: 1, name: "프리미엄 무선 헤드폰", price: 45000, quantity: 1 },
    { id: 2, name: "아로마 캔들 세트", price: 32000, quantity: 2 },
  ];

  const orderItems = useMemo(
    () => (initialItems.length > 0 ? initialItems : fallbackItems),
    [initialItems]
  );

  /** 결제상태 */
  const [paymentMethod, setPaymentMethod] = useState("method-0");
  const [submitting, setSubmitting] = useState(false);

  const [pointToUse, setPointToUse] = useState(0);
  const [availablePoints, setAvailablePoints] = useState(0);
  const [loadingPoints, setLoadingPoints] = useState(true);

  /** 내 정보 */
  const [myInfo, setMyInfo] = useState(null);

  useEffect(() => {
    if (!accessToken) {
      console.warn("토큰 없음 → getMyInfo 스킵");
      return;
    }

    const load = async () => {
      try {
        setLoadingPoints(true);
        const data = await getMyInfo();
        setMyInfo(data);
        setAvailablePoints(data.points ?? 0);
      } catch (e) {
        console.error("내정보 조회 실패", e);
      } finally {
        setLoadingPoints(false);
      }
    };

    load();
  }, [accessToken]);

  /** 금액권은 포인트 사용 불가 */
  useEffect(() => {
    if (isVoucherOrder) {
      setPaymentMethod("method-0");
      setPointToUse(0);
    }
  }, [isVoucherOrder]);

  /** 금액 계산 */
  const totalAmount = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const calcPaymentSplit = () => {
    const amount = totalAmount;

    let pointUsed = 0;
    if (!isVoucherOrder) {
      if (paymentMethod === "method-1") pointUsed = amount;
      else if (paymentMethod === "method-2")
        pointUsed = Math.max(
          0,
          Math.min(pointToUse || 0, amount, availablePoints)
        );
    }

    return { amount, pointUsed, cashAmount: amount - pointUsed };
  };

  const { pointUsed: previewPoint, cashAmount: previewCash } =
    calcPaymentSplit();

  /** --------------------------------------------------------
   * 금액권 결제 (SHOP-016 + SHOP-017)
   * -------------------------------------------------------- 
  */
  const handleVoucherPayment = async () => {
  try {
    setSubmitting(true);

    // 금액권 productId 확보 (숫자 보장)
    const voucherProductId = Number(orderItems[0].productId ?? orderItems[0].id);

    if (isNaN(voucherProductId)) {
      alert("금액권 상품 ID가 잘못되었습니다.");
      setSubmitting(false);
      return;
    }

    const voucherReq = {
      chatroomId,
      receiverId,
      productId: voucherProductId,   // 숫자만 들어감!
      amount: totalAmount
    };

    console.log("금액권 주문 생성 요청 데이터", voucherReq);
    const created = await createPointOrder(voucherReq);
    const orderId = created.orderId;

    const completed = await completePointOrder(orderId);

    // 금액권도 메신저 알림 전송 추가 
    if (chatroomId) {
      await requestPaymentAndGiftMessage(
        {
          orderId,
          amount: totalAmount,
          pointUsed: 0,  // 금액권은 항상 0
        },
        chatroomId
      );
    }
    else {
      const Res = await requestPaymentAndFirstGiftMessage(
                  {
                    orderId,
                    amount: totalAmount,
                    pointUsed: 0,  // 금액권은 항상 0
                  },
                  myInfo.userId,
                  myInfo.name,
                  receiverId,
                  receiverName);
      dispatch(setCurrentRoomId(Res.newChatroomId));
    }

    alert("금액권 결제가 완료되었습니다!");

    navigate(`/checkout/complete/${orderId}`, {
      state: {
        orderId,
        isVoucherOrder: true,
        items: orderItems,        // ← 금액권 상품 정보 전달
        totalPrice: totalAmount,  // ← 결제 금액 전달
      },
    });


  } catch (e) {
    console.error("금액권 결제 오류", e);
    alert("금액권 결제 중 오류가 발생했습니다.");
  } finally {
    setSubmitting(false);
  }
};

  /** --------------------------------------------------------
   * 일반상품 결제 (SHOP-006 + SHOP-009)
   * -------------------------------------------------------- 
  */
  const handlePayment = async () => {
    if (isVoucherOrder) return handleVoucherPayment();

    if (orderItems.length === 0) return alert("주문할 상품이 없습니다.");

    const { amount, pointUsed, cashAmount } = calcPaymentSplit();

    if (paymentMethod === "method-1" && availablePoints < totalAmount)
      return alert("보유 포인트가 부족합니다.");

    try {
      setSubmitting(true);

      /** 주문 생성 */
      const orderReq = {
        ...(receiverId ? { receiverId } : {}),
        ...(isGift && chatroomId ? { chatroomId } : {}),
        
        items: orderItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      const created = await createOrder(orderReq);

      const orderId = created.orderId;
      const backendPrice = created.totalPrice ?? totalAmount;

      if (!orderId) return alert("주문 생성 실패");

      /** 결제 요청 */
      const payReq = {
        orderId,
        amount,
        pointUsed,
      };

      let paymentRes;

      if (isGift && chatroomId)
        paymentRes = await requestPaymentAndGiftMessage(payReq, chatroomId);
      else if (isGift) {
        const Res = await requestPaymentAndFirstGiftMessage(payReq, myInfo.userId, myInfo.name, receiverId, receiverName);
        paymentRes = Res.paymentResponse;
        dispatch(setCurrentRoomId(Res.newChatroomId));
      }
      else paymentRes = await requestPayment(payReq);

      if (paymentRes.status === "SUCCESS") {
        alert(
          `결제 완료!\n현금: ${cashAmount.toLocaleString()}원 / 포인트: ${pointUsed.toLocaleString()}P`
        );

        try {
          await clearCartByUser();
        } catch (e) {
          console.error("장바구니 비우기 실패", e);
        }

        navigate(`/checkout/complete/${orderId}`, {
          state: {
            orderId,
            orderStatus: created.orderStatus,
            totalPrice: backendPrice,
            payment: paymentRes,
            items: orderItems,
            receiverId,
          },
        });
      } else {
        alert("결제 실패");
      }
    } catch (e) {
      console.error("결제 오류", e);
      alert("결제 처리 중 오류 발생");
    } finally {
      setSubmitting(false);
    }
  };

  /** --------------------------------------------------------
   * 렌더링
   * -------------------------------------------------------- 
  */
  return (
    <>
      <MainLayout maxWidth="800px">
        <Container className="py-4">
          <h2 className="fw-bold mb-5">주문/결제</h2>

          {/* 배송지 */}
          <section className="mb-5">
            <h5 className="fw-bold mb-3">배송지</h5>

            {isGift || isVoucherOrder ? (
              <Card className="bg-light border p-3">
                <div className="d-flex gap-3 mb-1">
                  <span className="text-muted" style={{ width: 60 }}>
                    수령인
                  </span>
                  <span>{receiverName}</span>
                </div>

                <div className="d-flex gap-3">
                  <span className="text-muted" style={{ width: 60 }}>
                    안내
                  </span>
                  <span className="small text-muted">
                    선물받는 친구가 직접 배송지를 입력합니다.
                  </span>
                </div>
              </Card>
            ) : (
              <Card className="bg-light border p-3">
                <div className="d-flex gap-3 mb-1">
                  <span className="text-muted" style={{ width: 60 }}>
                    수령인
                  </span>
                  <span>{myInfo?.name ?? "-"}</span>
                </div>

                <div className="d-flex gap-3 mb-1">
                  <span className="text-muted" style={{ width: 60 }}>
                    연락처
                  </span>
                  <span>{myInfo?.phone ?? "-"}</span>
                </div>

                <div className="d-flex gap-3">
                  <span className="text-muted" style={{ width: 60 }}>
                    주소
                  </span>
                  <span>{myInfo?.address ?? "등록된 배송지가 없습니다."}</span>
                </div>
              </Card>
            )}
          </section>

          {/* 결제수단 */}
          <section className="mb-5">
            <h5 className="fw-bold mb-3">결제수단</h5>

            <Form>
              <div className="mb-3 small text-muted">
                보유 포인트:{" "}
                {loadingPoints
                  ? "불러오는 중..."
                  : `${availablePoints.toLocaleString()} P`}
              </div>

              {["일반결제", "포인트 결제", "일반 + 포인트 결제"].map(
                (label, idx) => {
                  const key = `method-${idx}`;
                  const disabled = isVoucherOrder && key !== "method-0";

                  return (
                    <div
                      key={idx}
                      className={`mb-3 border rounded p-3 d-flex align-items-center ${
                        disabled ? "opacity-50" : ""
                      }`}
                    >
                      <Form.Check
                        type="radio"
                        name="paymentMethod"
                        id={`method-${idx}`}
                        label={label}
                        checked={paymentMethod === key}
                        disabled={disabled}
                        onChange={() => setPaymentMethod(key)}
                      />
                      {disabled && (
                        <span className="small text-muted ms-2">
                          금액권은 일반결제만 가능
                        </span>
                      )}
                    </div>
                  );
                }
              )}

              {paymentMethod === "method-2" && !isVoucherOrder && (
                <div>
                  <Form.Label>사용할 포인트</Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    max={Math.min(totalAmount, availablePoints)}
                    value={pointToUse}
                    onChange={(e) =>
                      setPointToUse(Number(e.target.value) || 0)
                    }
                  />
                  <div className="mt-2 small text-muted">
                    미리보기 — 포인트: {previewPoint.toLocaleString()}P / 현금:{" "}
                    {previewCash.toLocaleString()}원
                  </div>
                </div>
              )}
            </Form>
          </section>

          {/* 주문 상품 */}
          <section className="mb-5">
            <h5 className="fw-bold mb-3">주문 상품</h5>

            <div className="d-flex flex-column gap-3">
              {orderItems.map((item, idx) => {
                const imagePath =
                  item.imageUrl ||
                  (Array.isArray(item.imageUrl) ? item.imageUrl[0] : null);
                return (
                <Card
                  key={item.id ?? item.productId ?? idx}
                  className="border-0 bg-light p-3"
                >
                  <div className="d-flex justify-content-between">
                    <div className="d-flex align-items-center gap-3">
                      <img
                          src={resolveProductImage(imagePath)}
                          alt={item.name ?? item.productName ?? "상품 이미지"}
                          style={{
                            width: 56,
                            height: 56,
                            objectFit: "cover",
                            borderRadius: 8,
                            border: "1px solid #eee",
                            flexShrink: 0,
                          }}
                        />
                    <div>
                      <div className="fw-bold">
                        {item.name ?? item.productName}
                      </div>
                      <small className="text-muted">
                        수량 {item.quantity}개
                      </small>
                    </div>
                    </div>
                    <div className="fw-bold">
                      {(item.price * item.quantity).toLocaleString()}원
                    </div>
                  </div>
                </Card>
                );
              })}
            </div>
          </section>

          {/* 결제 정보 */}
          <section className="mb-5">
            <h5 className="fw-bold mb-3">결제 정보</h5>
            <Card className="p-4 border bg-light">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">총 상품금액</span>
                <span>{totalAmount.toLocaleString()}원</span>
              </div>

              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">배송비</span>
                <span>0원</span>
              </div>

              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">포인트 사용액</span>
                <span>{previewPoint.toLocaleString()}P</span>
              </div>

              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">현금 결제액</span>
                <span>{previewCash.toLocaleString()}원</span>
              </div>

              <hr />

              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-bold fs-5">최종 결제 금액</span>
                <span className="fw-bold fs-4 text-primary">
                  {totalAmount.toLocaleString()}원
                </span>
              </div>
            </Card>
          </section>
        </Container>
      </MainLayout>

      <FixedBottomButton width="800px">
        <Button
          variant="dark"
          className="w-100 py-3 fw-bold"
          size="lg"
          disabled={submitting}
          onClick={handlePayment}
        >
          {submitting
            ? "결제 처리 중..."
            : `${totalAmount.toLocaleString()}원 결제하기`}
        </Button>
      </FixedBottomButton>
    </>
  );
};

export default Checkout;