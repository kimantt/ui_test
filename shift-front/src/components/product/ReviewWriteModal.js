import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { createReview } from "../../api/productApi";

const ReviewWriteModal = ({ show, onClose, onSuccess, productId, orderItemId, productName }) => {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!orderItemId) {
      alert("리뷰를 작성할 주문 상품 정보가 없습니다.");
      return;
    }

    if (!content.trim()) {
      alert("리뷰 내용을 입력해 주세요.");
      return;
    }

    try {
      setSubmitting(true);
      await createReview({
        productId: Number(productId),
        orderItemId: Number(orderItemId),
        rating: Number(rating),
        content: content.trim(),
      });

      // 작성 성공 후 폼 초기화
      setRating(5);
      setContent("");

      // 부모에서 리뷰 목록 재조회
      if (onSuccess) {
        onSuccess(productName || "");
      }
      onClose();
    } catch (error) {
      console.error("리뷰 작성 실패", error);
      alert("리뷰 작성 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>리뷰 작성</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* 평점 선택 */}
          <Form.Group className="mb-3" controlId="reviewRating">
            <Form.Label>평점</Form.Label>
            <Form.Select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              disabled={submitting}
            >
              <option value={5}>★★★★★ (5점)</option>
              <option value={4}>★★★★☆ (4점)</option>
              <option value={3}>★★★☆☆ (3점)</option>
              <option value={2}>★★☆☆☆ (2점)</option>
              <option value={1}>★☆☆☆☆ (1점)</option>
            </Form.Select>
          </Form.Group>

          {/* 내용 입력 */}
          <Form.Group className="mb-3" controlId="reviewContent">
            <Form.Label>리뷰 내용</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="상품을 사용해본 느낌을 자유롭게 작성해 주세요."
              disabled={submitting}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            취소
          </Button>
          <Button
            variant="dark"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "작성 중..." : "작성하기"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ReviewWriteModal;
