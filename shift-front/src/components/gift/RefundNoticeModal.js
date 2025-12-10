import React from "react";
import { Modal, Button } from "react-bootstrap";

const RefundNoticeModal = ({ show, onConfirm, onCancel }) => {
  return (
    <Modal
      show={show}
      onHide={onCancel}
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>환불 불가 안내</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        금액권은 구매 후 <strong>환불이 불가능합니다.</strong>
        <br />
        계속 진행하시겠습니까?
      </Modal.Body>

      <Modal.Footer>
        <Button variant="dark" onClick={onConfirm}>
          예, 진행하기
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          아니오
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RefundNoticeModal;
