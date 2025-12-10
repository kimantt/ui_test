import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Container, Card, Button, Badge } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";
import MainLayout from "../../components/common/MainLayout";
import { getGiftDetail, acceptGift, confirmGift } from "../../api/giftApi";
import ReviewWriteModal from "../../components/product/ReviewWriteModal";
import httpClient from "../../api/httpClient";


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


const GiftDetail = () => {

  const { giftId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [gift, setGift] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false); // 처리 중 상태

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewProductId, setReviewProductId] = useState(null);
  const [reviewOrderItemId, setReviewOrderItemId] = useState(null);
  const [reviewProductName, setReviewProductName] = useState("");

  const giftTypeFromState = location.state?.giftType;



  // 상세 조회 함수
  const loadGiftDetail = async () => {
    try {
      const data = await getGiftDetail(giftId);

      let giftData = { ...data };
      let items = giftData.items;

      // 백엔드가 단일 상품 필드만 내려주는 경우를 대비 (productId, productName, quantity, orderItemId 등)
      if (!items || items.length === 0) {
        if (giftData.productId) {
          items = [
            {
              productId: giftData.productId,
              productName: giftData.productName,
              quantity: giftData.quantity,
              orderItemId: giftData.orderItemId,
              categoryId: giftData.categoryId,
            },
          ];
        } else {
          items = [];
        }
      }

      // 하나의 주문상품(= orderItemId)에 대해 리뷰 작성 여부 조회
      if (items.length > 0) {
        const itemsWithReview = await Promise.all(
          items.map(async (item) => {
            if (!item.orderItemId) return item;
        try {
          const res = await httpClient.get(
            `/products/order-items/${item.orderItemId}/reviews/check`
          );
          const { reviewWritten } = res.data || {};
          return { ...item, reviewWritten: !!reviewWritten };
        } catch (e) {
          console.error("리뷰 상태 조회 실패:", e);
          return item;
        }
        })
        );
        giftData = { ...giftData, items: itemsWithReview };
      } else {
        giftData = { ...giftData, items };
      }

      console.log("gift detail response", giftData);

      setGift(giftData);
    } catch (err) {
      console.error("선물 상세 조회 실패:", err);
    }
  };

  // 선물 상세 정보 API 호출
  useEffect(() => {
        loadGiftDetail(); // 분리한 함수 사용
  }, [giftId]);

    const currentGiftType = giftTypeFromState || gift?.giftType || "PRODUCT";


  // 수락 버튼 핸들러 (SHOP-019)
  const handleAccept = async () => {
    if (isProcessing || !gift) return;
    
    setIsProcessing(true);
    try {
      const response = await acceptGift(gift.orderId);
      
      // 백엔드 응답으로 상태 업데이트
      setGift((prev) =>
        prev
          ? {
              ...prev,
              orderStatus: response.orderStatus,
              deliveryStatus: response.deliveryStatus,
            }
          : prev
      );
      
      alert('선물을 수락했습니다!\n배송이 시작됩니다.');
    } catch (error) {
      console.error('선물 수락 실패:', error);
      alert('선물 수락 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 수령 확정 버튼 핸들러
  const handleConfirmReceipt = async () => {
    if (isProcessing || !gift) return;
    
    setIsProcessing(true);
    try {
      const response = await confirmGift(gift.orderId);
      
      // 백엔드 응답으로 상태 업데이트
      setGift((prev) =>
        prev
          ? {
              ...prev,
              orderStatus: response.orderStatus,
              deliveryStatus: response.deliveryStatus,
            }
          : prev
      );
      
      alert('수령이 확정되었습니다!');
    } catch (error) {
      console.error('수령 확정 실패:', error);
      alert('수령 확정 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 상품 상세 페이지 이동
  const handleGoToProductDetail = (productId) => {
    if (!productId) return;
    navigate(`/product/${productId}`);
  };

  // 리뷰 작성 버튼 핸들러
  const handleOpenReviewModal = (item) => {
    if (!item || !item.productId || !item.orderItemId) {
      alert("선물 정보를 찾을 수 없습니다.");
      return;
    }

    setReviewProductId(item.productId);
    setReviewOrderItemId(item.orderItemId);
    setReviewProductName(item.productName || `상품 ${item.productId}`);
    setShowReviewModal(true);
  };

  const handleReviewSuccess = async (productNameFromChild) => {
    const name = productNameFromChild || reviewProductName || "상품";
    alert(`[${name}] 리뷰를 작성하였습니다.`);

    setShowReviewModal(false);

    setGift((prev) => {
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

    // 필요 시 선물 상세 재조회 (상태가 바뀌면 반영)
    await loadGiftDetail();
  };

  // 로딩 중 표시
  if (!gift) {
    return (<MainLayout><Container className="py-5 text-center">로딩중...</Container></MainLayout>);
  }

  const items = gift.items || [];

    // 선물 요약 텍스트
  const giftSummary = (() => {
    if (!items || items.length === 0) {
      return gift.productName || "-";
    }
    if (items.length === 1) {
      return items[0].productName || `상품 ${items[0].productId}`;
    }
    return `${items[0].productName || `상품 ${items[0].productId}`} 외 ${
      items.length - 1
    }개`;
  })();

  // 리뷰 작성 가능 여부 판단
  const canWriteReviewForItem = (item) => {
    // 받은 선물의 경우: 배송완료(D) 후에만, 금액권(카테고리 3)은 제외
    if (currentGiftType !== "PRODUCT") return false;
    if (gift.deliveryStatus !== "D") return false;
    if (item.categoryId === 3) return false;
    if (item.reviewWritten === true) return false;
    return true;
  };

  // 액션 버튼 렌더링
  const renderActionButton = () => {
    if (currentGiftType !== 'PRODUCT') return null;

    const isPaid =
    gift.orderStatus === 'S' ||
    gift.orderStatus === 'PAID';
    // 배송 대기 → 수락 버튼
    if (isPaid && gift.deliveryStatus === 'P') {
      return (
        <Button 
          variant="dark" 
          size="lg" 
          onClick={handleAccept}
          disabled={isProcessing}
        >
          {isProcessing ? '처리 중...' : '수락'}
        </Button>
      );
    }

    // 배송중 → 수령 확정 버튼
    if (gift.deliveryStatus === 'S') {
      return (
        <Button 
          variant="dark" 
          size="lg" 
          onClick={handleConfirmReceipt}
          disabled={isProcessing}
        >
          {isProcessing ? '처리 중...' : '수령 확정'}
        </Button>
      );
    }  

    return null;
  };

  return (
    <MainLayout maxWidth="800px">
      {/* 상단 헤더 */}
      <div className="bg-white border-bottom sticky-top">
        <Container className="py-3 d-flex align-items-center">
          <Button
            variant="link"
            className="text-dark p-0 me-3"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft size={20} />
          </Button>
          <h5 className="mb-0 fw-bold">
            {gift.senderName}님의 선물
          </h5>
        </Container>
      </div>

      <Container className="py-4" style={{ maxWidth: "500px" }}>
        {/* 상품 이미지 및 정보 */}
        <Card className="border mb-4">
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div>
                <div className="text-muted small mb-1">선물 번호</div>
                <div className="fw-bold">#{gift.orderId}</div>
              </div>
              {currentGiftType === "PRODUCT" && (
                <Badge bg="light" text="dark" className="border fw-normal">
                  {mapDeliveryStatus(gift.deliveryStatus)}
                </Badge>
              )}
              {currentGiftType === "POINT" && (
                <Badge bg="light" text="dark" className="border fw-normal">
                  금액권
                </Badge>
              )}
            </div>

            <div className="mt-3">
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted small">주문일자</span>
                <span className="fw-medium">{gift.orderDate ?? "-"}</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted small">보낸 사람</span>
                <span className="fw-medium">{gift.senderName ?? "-"}</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted small">선물 내용</span>
                <span
                  className="fw-medium text-end"
                  style={{ maxWidth: "60%" }}
                >
                  {giftSummary}
                </span>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* 2. 선물 상품 목록 (주문상세의 "주문 상품" 카드와 유사, 사진 제거) */}
        {currentGiftType === "PRODUCT" && (
          <Card className="mb-4">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-3">선물 상품</h5>

              {items && items.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {items.map((item, idx) => {
                    const hasReview = item.reviewWritten === true;
                    const canWrite = canWriteReviewForItem(item);

                    return (
                      <Card
                        key={item.orderItemId ?? item.productId ?? idx}
                        className="border-0 border-bottom rounded-0"
                      >
                        <Card.Body className="px-0 py-3 d-flex justify-content-between align-items-center">
                          <div>
                            <div className="d-flex align-items-center gap-2">
                              {/* 상품명 클릭 시 상품 상세로 이동 */}
                              <span
                                role="button"
                                className="fw-bold text-decoration-underline"
                                onClick={() =>
                                  handleGoToProductDetail(item.productId)
                                }
                              >
                                {item.productName ||
                                  `상품 ${item.productId ?? ""}`}
                              </span>

                              {/* 리뷰 작성 버튼 (상품별) */}
                              {canWrite && (
                                <Button
                                  variant="outline-dark"
                                  size="sm"
                                  onClick={() => handleOpenReviewModal(item)}
                                >
                                  리뷰 작성
                                </Button>
                              )}

                              {/* 리뷰 작성 완료 뱃지 */}
                              {gift.deliveryStatus === "D" && hasReview && (
                                <Badge bg="light" text="secondary">
                                  리뷰 작성 완료
                                </Badge>
                              )}
                            </div>

                            <div className="text-muted small mt-1">
                              수량: {item.quantity}개
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-muted small">
                  선물 상품 정보가 없습니다.
                </div>
              )}
            </Card.Body>
          </Card>
        )}

        {/* 3. 배송 정보 카드 (배송지 + 배송 상태) */}
        {currentGiftType === "PRODUCT" && (
          <Card className="border mb-4">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-3">배송 정보</h5>
              <div className="mb-2">
                <div className="text-muted small mb-1">배송지</div>
                <div className="fw-medium">
                  {gift.deliveryAddress || "배송지 정보 없음"}
                </div>
              </div>
              <div className="mb-1">
                <div className="text-muted small mb-1">배송 상태</div>
                <div className="fw-medium">
                  {mapDeliveryStatus(gift.deliveryStatus)}
                </div>
              </div>
            </Card.Body>
          </Card>
        )}        

        {/* 포인트 적립 안내 - 금액권일 때만 표시 */}
        {currentGiftType === 'POINT' && (
          <Card className="border mb-4 bg-light">
            <Card.Body className="p-4 text-center">
              <div className="text-success mb-3">
                <strong>✓ 포인트 적립 완료</strong>
              </div>
              {gift.earnedPoints && (
                <div className="mb-2">
                  <span className="fw-bold text-primary fs-4">
                    +{gift.earnedPoints.toLocaleString()} P
                  </span>
                </div>
              )}
              <div className="text-muted small">
                금액권이 포인트로 적립되었습니다.
              </div>
            </Card.Body>
          </Card>
        )}

        {/* 액션 버튼 영역 */}
        <div className="d-grid gap-2">
          {renderActionButton()}
        </div>
      </Container>
      
      {/* 리뷰 작성 모달 */}
      <ReviewWriteModal
        show={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSuccess={handleReviewSuccess}
        productId={reviewProductId}
        orderItemId={reviewOrderItemId}
        productName={reviewProductName}
      />
    </MainLayout>
  );
};

export default GiftDetail;