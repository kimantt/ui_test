import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Card, Button, Spinner, Alert, Form } from "react-bootstrap";
import MainLayout from "../../components/common/MainLayout";
import { updateReview } from "../../api/productApi";
import "../../styles/review-form.css"; // (공통 스타일)

const ReviewEdit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const rev = location.state;

  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!rev) {
      setError("리뷰 정보를 찾을 수 없습니다.");
      setLoading(false);
      return;
    }

    setRating(rev.rating);
    setContent(rev.content);
    setLoading(false);
  }, [rev]);

  const handleUpdate = async () => {
    if (!rating) {
      alert("별점을 선택해주세요.");
      return;
    }
    if (!content.trim()) {
      alert("리뷰 내용을 입력해주세요.");
      return;
    }

    try {
      setActionLoading(true);

      const dto = {
        reviewId: rev.reviewId,
        rating,
        content,
      };

      await updateReview(dto);

      alert("리뷰가 수정되었습니다.");
      navigate("/mypage", { state: { activeTab: "reviews" } });
    } catch (e) {
      console.error(e);
      alert("리뷰 수정 중 오류가 발생했습니다.");
    } finally {
      setActionLoading(false);
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

  if (error) {
    return (
      <MainLayout maxWidth="800px">
        <Container className="py-5">
          <Alert variant="danger">{error}</Alert>
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
          <h3 className="fw-bold m-0">리뷰 수정</h3>
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

            <div className="review-form-product">{rev.productName}</div>

            <div className="text-muted small mt-1">
              {rev.price?.toLocaleString()}원 · {rev.seller}
            </div>
          </Card.Body>
        </Card>

        {/* 별점 */}
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
              placeholder="솔직한 리뷰를 수정해주세요. (최대 500자)"
            />
            <div className="review-form-counter">{content.length}/500</div>
          </Card.Body>
        </Card>

        {/* 수정 버튼 */}
        <Button
          variant="dark"
          className="review-form-submit"
          disabled={actionLoading}
          onClick={handleUpdate}
        >
          {actionLoading ? "처리 중..." : "수정 완료"}
        </Button>

      </Container>
    </MainLayout>
  );
};

export default ReviewEdit;
