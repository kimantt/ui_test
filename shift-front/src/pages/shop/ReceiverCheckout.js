import React from "react";
import { Container, Button, Card } from "react-bootstrap";
import { BsArrowLeft, BsWallet2, BsCheckCircle } from "react-icons/bs";
import MainLayout from "../../components/common/MainLayout";
import FixedBottomButton from "../../components/common/FixedBottomButton";

const ReceiverCheckout = ({ onNavigate }) => {
  const product = {
    name: "프리미엄 무선 헤드폰",
    price: 45000,
    category: "전자기기",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80",
  };

  const budget = 50000;
  const remaining = budget - product.price;

  return (
    <>
      {/* 콘텐츠 영역 */}
      <MainLayout maxWidth="700px">
        {/* 자체 Header */}
        <div className="px-4 py-3 border-bottom d-flex align-items-center bg-white">
          <Button
            variant="link"
            className="text-dark p-0 me-3"
            onClick={() => onNavigate("receiver-select")}
          >
            <BsArrowLeft size={24} />
          </Button>
          <h5 className="m-0 fw-bold">선물 확인</h5>
        </div>

        <Container className="py-4 flex-grow-1">
          {/* 상품 카드 */}
          <Card className="mb-4 border-2 overflow-hidden">
            <div
              className="bg-light d-flex justify-content-center align-items-center"
              style={{ height: "300px" }}
            >
              <img
                src={product.image}
                alt={product.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
            <Card.Body>
              <div className="text-muted small mb-1">{product.category}</div>
              <h5 className="fw-bold mb-2">{product.name}</h5>
              <h4 className="fw-bold">{product.price.toLocaleString()}원</h4>
            </Card.Body>
          </Card>

          {/* 예산 상세 */}
          <Card className="mb-4 border-2 p-3">
            <h6 className="fw-bold mb-3">예산 상세</h6>

            <div className="d-flex justify-content-between mb-2 text-secondary">
              <span>총 선물 예산</span>
              <span>{budget.toLocaleString()}원</span>
            </div>

            <div className="d-flex justify-content-between mb-3 text-secondary">
              <span>선택한 상품</span>
              <span className="text-dark">
                -{product.price.toLocaleString()}원
              </span>
            </div>

            <hr />

            <div className="d-flex justify-content-between align-items-center">
              <span className="fw-bold">남은 잔액</span>
              <span className="fw-bold fs-5 text-primary">
                {remaining.toLocaleString()}원
              </span>
            </div>
          </Card>

          {/* 월렛 적립 안내 */}
          {remaining > 0 && (
            <div
              className="alert alert-light border-start border-4 border-dark d-flex gap-3 mb-4"
              role="alert"
            >
              <BsWallet2 size={24} className="flex-shrink-0 mt-1" />
              <div>
                <div className="fw-bold mb-1">월렛 적립</div>
                <div className="small text-secondary">
                  남은 잔액{" "}
                  <span className="fw-bold text-dark">
                    {remaining.toLocaleString()}원
                  </span>
                  은 월렛으로 적립되어 나중에 사용할 수 있어요!
                </div>
              </div>
            </div>
          )}

          {/* 안내 메시지 */}
          <div className="d-flex gap-2 align-items-start p-3 bg-light rounded border mb-4">
            <BsCheckCircle className="mt-1 flex-shrink-0" />
            <span className="small text-secondary">
              선물을 확정하면 배송지 입력 단계로 넘어갑니다.
            </span>
          </div>
        </Container>
      </MainLayout>

      {/* 하단 고정 버튼 */}
      <FixedBottomButton width="700px">
        <Button
          variant="dark"
          className="w-100 py-3 fw-bold"
          size="lg"
          onClick={() => alert("선물이 확정되었습니다!")}
        >
          선물 확정 & 받기
        </Button>
      </FixedBottomButton>
    </>
  );
};

export default ReceiverCheckout;