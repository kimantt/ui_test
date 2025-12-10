import React from 'react';
import { Modal, Button, Alert, Card, Badge } from 'react-bootstrap';

const PointWarningModal = ({ show, onHide, onConfirm, points }) => {
  return (
    <Modal 
      show={show} 
      onHide={onHide}
      centered
      size="lg"
    >
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="w-100 text-center">
          <h4 className="text-danger mt-2">포인트 소멸 경고</h4>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center px-4">
        <Alert variant="light" className="border-0 bg-light">
          <p className="text-muted mb-2">현재 보유 포인트</p>
          <h1 className="text-danger fw-bold mb-0" style={{ fontSize: '3rem' }}>
            {points?.toLocaleString()}
            <small className="text-danger ms-2" style={{ fontSize: '2rem' }}>P</small>
          </h1>
        </Alert>

        <Card className="border-warning mt-4">
          <Card.Body className="py-4">
            <div className="d-flex flex-column gap-3 text-start">
              <div className="d-flex align-items-start">
                <Badge bg="warning" text="dark" className="me-2 mt-1">!</Badge>
                <span>탈퇴 시 보유하신 <strong>모든 포인트가 즉시 소멸</strong>됩니다</span>
              </div>
              <div className="d-flex align-items-start">
                <Badge bg="warning" text="dark" className="me-2 mt-1">!</Badge>
                <span>소멸된 포인트는 <strong>복구할 수 없습니다</strong></span>
              </div>
              <div className="d-flex align-items-start">
                <Badge bg="warning" text="dark" className="me-2 mt-1">!</Badge>
                <span>포인트를 <strong>먼저 사용하신 후</strong> 탈퇴하시는 것을 권장합니다</span>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Modal.Body>
      <Modal.Footer className="border-0 justify-content-center gap-2 pb-4">
        <Button 
          variant="outline-secondary" 
          size="lg"
          onClick={onHide}
          className="px-4"
        >
          취소
        </Button>
        <Button 
          variant="danger"
          size="lg"
          onClick={onConfirm}
          className="px-4"
        >
          포인트 소멸하고 탈퇴
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PointWarningModal;