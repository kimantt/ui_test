import React from "react";
import { Modal, Button } from "react-bootstrap";

const AddToCartModal = ({ show, onConfirm, onCancel }) => {
  return (
    <Modal show={show} centered onHide={onCancel}>
      <Modal.Body className="text-center py-4">
        <p className="fw-bold mb-4">상품이 장바구니에 담겼습니다.</p>
        <p className="text-muted mb-4">장바구니로 이동하시겠습니까?</p>

        <div className="d-flex gap-3 justify-content-center mt-3">

          {/* 네 버튼이 왼쪽 */}
          <Button variant="dark" onClick={onConfirm} className="px-4">
            네
          </Button>

          {/* 아니요 버튼이 오른쪽 */}
          <Button variant="secondary" onClick={onCancel} className="px-4">
            아니요
          </Button>

        </div>
      </Modal.Body>
    </Modal>
  );
};

export default AddToCartModal;