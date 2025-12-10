import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createReview, checkReviewStatus, getProductDetail } from "../../api/productApi";
import { Container, Card, Button, Spinner, Alert, Form } from "react-bootstrap";
import MainLayout from "../../components/common/MainLayout";
import "../../styles/review-form.css"; // 공통 스타일

const ReviewCreate = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const productId = params.get("productId");
  const orderItemId = params.get("orderItemId");

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);

  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // 리뷰 작성 가능한지 + 상품 정보 가져오기
  useEffect(() => {
    const load = async () => {
      try {
        // 1) 상품 정보
        const productData = await getProductDetail(productId);
        setProduct(productData);

        // 2) 작성 가능 여부 체크
        const result = await checkReviewStatus(orderItemId);

        if (!result.reviewAvailable) {
          const msg = result.reviewWritten
            ? "이미 이 주문상품에 대해 리뷰를 작성하셨습니다."
            : "배송 완료된 주문만 리뷰 작성이 가능합니다.";
          alert(msg);
          navigate("/mypage", { state: { activeTab: "reviews" } });
          return;
        }
      } catch (e) {
        console.error(e);
        alert("리뷰 작성 정보를 불러오는 중 오류가 발생했습니다.");
        navigate("/mypage", { state: { activeTab: "reviews" } });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [orderItemId, productId, navigate]);

  const handleSubmit = async () => {
    if (rating === 0) return alert("별점을 선택해주세요.");
    if (!content.trim()) return alert("리뷰 내용을 입력해주세요.");

    const dto = {
      productId: Number(productId),
      orderItemId: Number(orderItemId),
      rating,
      content,
    };

    try {
      await createReview(dto);
      alert("리뷰가 등록되었습니다.");
      navigate("/mypage", { state: { activeTab: "reviews" } });
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        alert("로그인이 필요합니다.");
        navigate("/login");
      } else {
        alert("리뷰 등록 중 오류가 발생했습니다.");
      }
    }
  };

  if (loading) {
    return (
      <MainLayout maxWidth="800px">
        <Container className="py-5 d-flex justify-content-center">
          <Spinner animation="border" />
        </Container>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout maxWidth="800px">
        <Container className="py-5">
          <Alert variant="danger">상품 정보를 불러올 수 없습니다.</Alert>
          <Button
            variant="secondary"
            onClick={() => navigate("/mypage", { state: { activeTab: "reviews" } })}
          >
            뒤로가기
          </Button>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout maxWidth="800px">
      <Container className="py-4">

        {/* 제목 + 뒤로가기 */}
        <div className="review-form-header">
          <h3 className="fw-bold m-0">리뷰 작성</h3>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() =>
              navigate("/mypage", { state: { activeTab: "reviews" } })
            }
          >
            뒤로가기
          </Button>
        </div>

        {/* 상품 정보 */}
        <Card className="mb-4">
          <Card.Body className="p-4">
            <div className="review-form-title">상품 정보</div>

            <div className="review-form-product">{product.productName}</div>

            <div className="text-muted small mt-1">
              {product.price?.toLocaleString()}원 · {product.seller}
            </div>
          </Card.Body>
        </Card>

        {/* 별점 선택 */}
        <Card className="mb-4">
          <Card.Body className="p-4">
            <div className="review-form-title">별점</div>

            <div className="review-form-stars">
              {[1, 2, 3, 4, 5].map((num) => (
                <span
                  key={num}
                  onClick={() => setRating(num)}
                  style={{
                    color: rating >= num ? "#ffd700" : "#ccc",
                  }}
                >
                  ★
                </span>
              ))}
            </div>
          </Card.Body>
        </Card>

        {/* 리뷰 내용 */}
        <Card className="mb-4">
          <Card.Body className="p-4">
            <div className="review-form-title">리뷰 내용</div>
            <Form.Control
              as="textarea"
              rows={6}
              maxLength={500}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="솔직한 리뷰를 작성해주세요. (최대 500자)"
            />
            <div className="review-form-counter">{content.length}/500</div>
          </Card.Body>
        </Card>

        {/* 등록 버튼 */}
        <Button
          variant="dark"
          className="review-form-submit"
          onClick={handleSubmit}
        >
          작성 완료
        </Button>

      </Container>
    </MainLayout>
  );
};

export default ReviewCreate;