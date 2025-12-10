import React from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { useState } from "react";
import { findUserId } from "../../api/userApi";

const FindIdModal = ({ show, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  const [foundId, setFoundId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setFormData({
      name: "",
      phone: "",
    });
    setFoundId(null);
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    // 유효성 검사
    if (!formData.name || !formData.phone) {
      alert("이름과 전화번호를 모두 입력해주세요.");
      return;
    }

    setLoading(true);
    setError(null);
    setFoundId(null);

    try {
      const response = await findUserId(formData);
      setFoundId(response.loginId);
    } catch (err) {
      setError(err.response?.data?.message || "아이디를 찾을 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>아이디 찾기</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        {foundId ? (
          <div>
            <p>찾으신 아이디는 다음과 같습니다:</p>
            <h4>{foundId}</h4>
            <Button variant="dark" className="mt-3" onClick={handleClose}>
              로그인 하러가기
            </Button>
          </div>
        ) : (
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>이름</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                placeholder="이름을 입력해주세요"
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>전화번호</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                value={formData.phone}
                placeholder="전화번호를 입력해주세요(- 제외)"
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </Form.Group>

            {error && (
              <div className="text-danger text-center mb-3 small">{error}</div>
            )}

            <Button
              variant="dark"
              className="w-100 mt-4"
              onClick={handleSubmit}
              disabled={loading}
            >
              아이디 찾기
            </Button>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default FindIdModal;
