import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const PasswordConfirmModal = ({ show, onHide, onConfirm }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!password) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    onConfirm(password);
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>본인 확인</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <p className="text-muted mb-3">회원탈퇴를 위해 비밀번호를 입력해주세요</p>
          <Form.Group>
            <Form.Label>비밀번호</Form.Label>
            <Form.Control
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              isInvalid={!!error}
            />
            <Form.Control.Feedback type="invalid">
              {error}
            </Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            취소
          </Button>
          <Button variant="dark" type="submit">
            확인
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default PasswordConfirmModal;