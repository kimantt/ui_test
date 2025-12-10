import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Card, Button, Spinner, Alert, Badge, Modal } from "react-bootstrap";
import MainLayout from "../../components/common/MainLayout";
import { getOrderDetail, cancelOrder, requestRefund, confirmOrder } from "../../api/orderApi";
import ReviewWriteModal from "../../components/product/ReviewWriteModal";
import httpClient from "../../api/httpClient";
import { resolveProductImage } from "../../utils/productImages";


const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false); // 취소/환불 진행 중 플래그

  // 리뷰 모달 상태
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewProductId, setReviewProductId] = useState(null);
  const [reviewOrderItemId, setReviewOrderItemId] = useState(null);
  const [reviewProductName, setReviewProductName] = useState("");


  // 취소 모달/진행 상태
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelSubmitting, setCancelSubmitting] = useState(false);

 
  const formatNumber = (num) => {
    if (num == null) return "-";
    return Number(num).toLocaleString();
  };

  const formatDateTime = (str) => {
    if (!str) return "";
    // "2025-10-29" 또는 "2025-10-29T13:20:00" 를 그대로 표시하거나 필요 시 포맷
    return str;
  };

  const mapDeliveryStatus = (status) => {
    switch (status) {
      case "P":
        return "배송준비중";
      case "S":
        return "배송중";
      case "D":
        return "배송완료";
      case "C":
        return "취소";
      default:
        return status || "-";
    }
  };

 const mapPaymentStatus = (status) => {
    switch (status) {
      case "SUCCESS":
        return "결제완료";
      case "PENDING":
        return "결제대기";
      case "CANCELED":
        return "결제취소";
      default:
        return status || "-";
    }
  };

  // 주문 상세 재조회 함수
  const loadDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getOrderDetail(orderId);
      console.log("ORDER ITEMS:", data.items);

      // 각 주문상품(orderItem)에 대해 리뷰 작성 여부를 서버에서 조회
      if (data.items && data.items.length > 0) {
        const itemsWithReview = await Promise.all(
          data.items.map(async (item) => {
            try {
              const res = await httpClient.get(
                `/products/order-items/${item.orderItemId}/reviews/check`
              );
              const { reviewWritten } = res.data || {};
              return { ...item, reviewWritten: !!reviewWritten };
            } catch (e) {
              console.error("리뷰 상태 조회 실패:", e);
              return item; // 실패하면 기존 데이터 그대로 사용
            }
          })
        );
        data.items = itemsWithReview;
      }

      setOrder(data);
    } catch (e) {
      console.error("주문 상세 조회 실패", e);
      setError("주문 상세 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [orderId]);

  // 주문 취소 가능 여부: 주문상태 S + 배송상태 P 조건을
  // payment.status(SUCCESS) + delivery.status(P)로 판단
  
  // 안전하게 order가 null일 수 있으므로 optional chaining으로 보호
  const paymentStatus = order?.payment?.status; // SUCCESS / PENDING / CANCELED
  const deliveryStatus = order?.delivery?.status; // P / S / D / C

  // 금액권(카테고리 ID=3) 주문 여부 플래그
  const isGiftVoucher = order?.items?.some((item) => item.categoryId === 3);

  // "나에게 구매"인지 여부 (sender == receiver)
  const isSelfOrder =
    order && order.senderId != null && order.receiverId != null
      ? order.senderId === order.receiverId
      : false;

  // 주문 취소 가능 여부: 주문상태 S + 배송상태 P 조건을
  // payment.status(SUCCESS) + delivery.status(P)로 판단
  const canCancel =
    paymentStatus === "PENDING" &&
    (deliveryStatus === "P" || deliveryStatus == null);

/**
   * 환불 가능 조건 (SHOP-013)
   * - 결제완료(SUCCESS)
   * - 배송 상태가 취소(C)가 아닌 경우
   */
  const canRefund =
    isSelfOrder &&
    paymentStatus === "SUCCESS" && 
    deliveryStatus !== "C" &&
    deliveryStatus !== "D" && // 구매확정 후(D,D)는 환불 버튼 숨김
    !isGiftVoucher;  // 금액권이면 환불 버튼 숨김

   /**
   * 구매확정 가능 조건 (SHOP-020, "나에게 구매"만 우선)
   * - 나에게 구매 (sender == receiver)
   * - 결제완료(SUCCESS)
   * - 배송이 취소되지 않음
   * - 이미 배송완료(D) 상태에서 확정하는 시나리오도 허용 (또는 여기서 조건 조정 가능)
   */
  const canConfirmPurchase =
    isSelfOrder &&
    paymentStatus === "SUCCESS" &&
    deliveryStatus !== "C" &&
    deliveryStatus !== "D"; // 이미 확정된 건 또 못 누르게

  /**
   * 리뷰 작성 버튼 노출 조건
   * - 나에게 구매
   * - 결제완료(SUCCESS)
   * - 배송상태 D (구매확정 이후)
   * - 금액권 주문 아님
   */
  const canWriteReview =
    isSelfOrder &&
    paymentStatus === "SUCCESS" &&
    deliveryStatus === "D" &&
    !isGiftVoucher;

  // 주문 취소
  const handleCancelOrder = async () => {
    if (!order) return;

    const ok = window.confirm("주문을 취소하시겠습니까?");
    if (!ok) return;

    try {
      setActionLoading(true);
      const res = await cancelOrder(order.orderId);

      if (!res?.result) {
        alert("현재 상태에서는 주문을 취소할 수 없습니다.");
        return;
      }

      alert("주문이 취소되었습니다.");
      await loadDetail(); // 상태 다시 조회
    } catch (e) {
      console.error("주문 취소 실패", e);
      alert("주문 취소 중 오류가 발생했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  // 환불 요청
  const handleRefund = async () => {
    if (!order) return;

    const ok = window.confirm("환불을 요청하시겠습니까?");
    if (!ok) return;

    // 환불 요청 금액 = 결제된 현금 + 포인트
    const cash = order.payment?.cashAmount ?? 0;
    const point = order.payment?.pointUsed ?? 0;
    const amount = cash + point;

    try {
      setActionLoading(true);
      const res = await requestRefund(order.orderId, amount);

      if (!res?.result) {
        alert("환불 요청에 실패했습니다.");
        return;
      }

      alert("환불이 완료되었습니다.");
      // 환불 완료 후 주문 목록(Mypage - 주문목록 탭)으로 자동 이동
      navigate("/mypage", { state: { activeTab: "orders" } });
    } catch (e) {
      console.error("환불 요청 실패", e);
      alert("환불 처리 중 오류가 발생했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  // 구매확정 (나에게 구매용)
  const handleConfirmPurchase = async () => {
    if (!order) return;

    const ok = window.confirm("정말 구매확정하시겠습니까? 구매확정 후엔 환불이 불가합니다.");
    if (!ok) return;

    try {
      setActionLoading(true);
      const res = await confirmOrder(order.orderId);

      if (!res?.result) {
        alert("현재 상태에서는 구매를 확정할 수 없습니다.");
        return;
      }

      alert("구매가 확정되었습니다.");
      await loadDetail(); // 주문/배송 상태 재조회 (D,D 포함)
    } catch (e) {
      console.error("구매확정 실패", e);
      alert("구매 확정 중 오류가 발생했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  // 상품 상세로 이동
  const handleGoToProductDetail = (productId) => {
    if (!productId) return;
    navigate(`/product/${productId}`);
  };

  // 리뷰 작성 모달 열기
  const handleOpenReviewModal = (targetItem) => {
    if (!order || !order.items || order.items.length === 0) {
      alert("리뷰를 작성할 상품 정보를 찾을 수 없습니다. (상품 없음)");
      return;
    }

    if (!targetItem.productId) {
      alert("리뷰를 작성할 상품 정보를 찾을 수 없습니다. (productId 없음)");
      return;
    }

    setReviewProductId(targetItem.productId);
    setReviewOrderItemId(targetItem.orderItemId);
    setReviewProductName(
    targetItem.productName || `상품 ${targetItem.productId}`
  );
    setShowReviewModal(true);
  };

  // 리뷰 작성 성공 시 콜백 (필요하면 상세 재조회)
  const handleReviewSuccess = async (productNameFromChild) => {
    const name = productNameFromChild || reviewProductName || "상품";
    alert(`[${name}]의 리뷰를 작성하였습니다.`);

    setShowReviewModal(false);
    setOrder((prev) => {
      if (!prev || !prev.items) return prev;
      return {
        ...prev,
        items: prev.items.map((it) =>
          it.orderItemId === reviewOrderItemId
            ? { ...it, reviewWritten: true }
            : it
        ),
      };
    });
    // 서버 기준으로 주문 + 리뷰 여부 다시 조회
    await loadDetail();
  };

  return (
    <MainLayout maxWidth="800px">
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold m-0">주문 상세</h3>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => navigate(-1)}
          >
            뒤로가기
          </Button>
        </div>

        {loading && (
          <div className="d-flex justify-content-center py-5">
            <Spinner animation="border" />
          </div>
        )}

        {error && <Alert variant="danger">{error}</Alert>}

        {!loading && !error && !order && (
          <div className="text-muted">주문 정보를 찾을 수 없습니다.</div>
        )}

        {!loading && !error && order && (
          <>
            {/* 주문 기본 정보 */}
            <Card className="mb-4">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <div className="text-muted small mb-1">주문번호</div>
                    <div className="fw-bold">#{order.orderId}</div>
                  </div>
                  <Badge bg="light" text="dark" className="border fw-normal">
                    {mapDeliveryStatus(order.delivery?.status)}
                  </Badge>
                </div>

                <div className="mt-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted small">주문일자</span>
                    <span className="fw-medium">
                      {formatDateTime(order.orderDate)}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted small">보내는 사람</span>
                    <span className="fw-medium">
                      {/* senderName이 내려오면 그걸 사용 */}
                      {order.senderName ?? `ID ${order.senderId ?? "-"}`}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted small">받는 사람</span>
                    <span className="fw-medium">
                      {order.receiverName ?? `ID ${order.receiverId ?? "-"}`}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted small">운송장 번호</span>
                    <span className="fw-medium">
                      {order.delivery?.trackingNumber ?? "-"}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted small">결제 상태</span>
                    <span className="fw-medium">
                      {mapPaymentStatus(order.payment?.status)}
                    </span>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* 주문 상품 목록 */}
            <Card className="mb-4">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-3">주문 상품</h5>

                {order.items && order.items.length > 0 ? (
                  <div className="d-flex flex-column gap-3">
                    {order.items.map((item, idx) => {
                        const hasReview = item.reviewWritten === true;
                      return (
                      <Card
                        key={item.productId ?? idx}
                        className="border-0 border-bottom rounded-0"
                      >
                        <Card.Body className="px-0 py-3 d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-3">
                              <div
                                role="button"
                                onClick={() =>
                                  handleGoToProductDetail(item.productId)
                                }
                                style={{ flexShrink: 0 }}
                              >
                                <img
                                  src={resolveProductImage(item.imageUrl)}
                                  alt={
                                    item.productName ??
                                    `상품 ${item.productId}`
                                  }
                                  style={{
                                    width: 56,
                                    height: 56,
                                    objectFit: "cover",
                                    borderRadius: 8,
                                    border: "1px solid #eee",
                                  }}
                                />
                              </div>

                              <div>
                                <div className="d-flex align-items-center gap-2">
                                  <span
                                      role="button"
                                      className="fw-bold text-decoration-underline"
                                      onClick={() =>
                                        handleGoToProductDetail(item.productId)
                                      }
                                    >
                                     {item.productName ?? `상품 ${item.productId}`}
                                  </span>
                            {canWriteReview && !hasReview && (
                                  <Button
                                    variant="outline-dark"
                                    size="sm"
                                    onClick={() =>
                                      handleOpenReviewModal(item)
                                    }
                                  >
                                    리뷰 작성
                                  </Button>
                                )}
                            </div>

                            <div className="text-muted small">
                              수량: {item.quantity}개
                            </div>
                          </div>
                        </div>
                          <div className="text-end">
                            <div className="text-muted small">
                              단가: {formatNumber(item.itemPrice)}원
                            </div>
                            <div className="fw-bold">
                              {(item.itemPrice * item.quantity).toLocaleString()}원
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-muted small">
                    주문 상품 정보가 없습니다.
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* 결제 정보 */}
            <Card className="mb-4">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-3">결제 정보</h5>

                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">총 상품금액</span>
                  <span className="fw-bold">
                    {formatNumber(order.totalPrice)}원
                  </span>
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">현금 결제</span>
                  <span className="fw-bold">
                    {formatNumber(order.payment?.cashAmount)}원
                  </span>
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">포인트 사용</span>
                  <span className="fw-bold text-primary">
                    {formatNumber(order.payment?.pointUsed)}P
                  </span>
                </div>
              </Card.Body>
            </Card>


             {/* 취소 / 환불 / 구매확정 버튼 영역 */}
            {(canConfirmPurchase || canCancel || canRefund) && (
              <div className="d-flex flex-column gap-2 mt-3">
                {/* 구매확정 */}
                {canConfirmPurchase && (
                  <Button
                    variant="dark"
                    className="flex-grow-1"
                    disabled={actionLoading}
                    onClick={handleConfirmPurchase}
                  >
                    {actionLoading ? "처리 중..." : "구매 확정"}
                  </Button>
                )}
                
                {/* 주문 취소 / 환불 요청 버튼 */}
                {(canCancel || canRefund) && (
                  <div className="d-flex gap-2">
                    {canCancel && (
                      <Button
                        variant="outline-danger"
                        className="flex-grow-1"
                        disabled={actionLoading}
                        onClick={handleCancelOrder}
                      >
                        {actionLoading ? "처리 중..." : "주문 취소"}
                      </Button>
                    )}

                    {canRefund && (
                      <Button
                        variant="danger"
                        className="flex-grow-1"
                        disabled={actionLoading}
                        onClick={handleRefund}
                      >
                        {actionLoading ? "처리 중..." : "환불 요청"}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
        {/* 리뷰 작성 모달 */}
        <ReviewWriteModal
          show={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onSuccess={handleReviewSuccess}
          orderItemId={reviewOrderItemId}
          productId={reviewProductId}
          productName={reviewProductName}
        />
      </Container>
    </MainLayout>
  );
};

export default OrderDetail;
