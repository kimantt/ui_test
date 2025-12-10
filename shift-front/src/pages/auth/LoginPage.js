import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../api/authApi";
import { loginSuccess } from "../../store/authSlice";
import FindIdModal from "../../components/user/FindIdModal";
import { storage } from "../../utils/storage";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    loginId: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 모달 표시 상태
  const [showFindIdModal, setShowFindIdModal] = useState(false);

  /**
   * payload: {
   *  loginId: string,
   *  password: string
   * }
   */
  const handleLogin = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.loginId || !formData.password) {
      alert("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    setLoading(true);

    try {
      // 로그인 요청
      const data = await loginUser(formData);

      const { accessToken } = data;

      // 액세스 토큰 저장(localStorage + redux)
      storage.setToken(accessToken);
      dispatch(loginSuccess({ accessToken: accessToken })); // Redux 상태 업데이트

      navigate("/friends");
    } catch (error) {
      console.error("Login error:", error);
      alert("로그인에 실패했습니다. 다시 시도해주세요.");
    }

    setLoading(false);
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 ">
      <div
        className="bg-white border rounded-4 py-5 shadow-sm"
        style={{ maxWidth: "480px", width: "100%" }}
      >
        {/* Logo */}
        <div className="mb-5 text-center">
          <h1 className="display-4 fw-bold text-dark tracking-tight">Shift</h1>
          <p className="text-secondary small">마음을 전하다</p>
        </div>

        {/* Form */}
        <Form className="w-100 px-4" onSubmit={handleLogin}>
          <Form.Group className="mb-3" controlId="formId">
            <Form.Label className="small text-secondary">ID</Form.Label>
            <Form.Control
              type="text"
              name="loginId"
              placeholder="아이디를 입력하세요"
              value={formData.loginId}
              className="py-3 border-2 shadow-none"
              autoComplete="off"
              style={{ borderColor: "#eee" }}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-4" controlId="formPassword">
            <Form.Label className="small text-secondary">Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              placeholder="비밀번호를 입력하세요"
              value={formData.password}
              className="py-3 border-2 shadow-none"
              autoComplete="off"
              style={{ borderColor: "#eee" }}
              onChange={handleChange}
            />
          </Form.Group>

          <Button
            type="submit"
            className="w-100 py-3 fw-bold mt-4 border-0"
            style={{ backgroundColor: "black", color: "white" }}
            disabled={loading}
          >
            Login
          </Button>
        </Form>

        {/* Bottom Links */}
        <div className="mt-4 d-flex align-items-center gap-3 small text-secondary justify-content-center">
          <span
            role="button"
            className="text-decoration-none hover-text-dark"
            onClick={() => setShowFindIdModal(true)}
          >
            아이디 찾기
          </span>
          <span style={{ color: "#e0e0e0" }}>|</span>
          <span
            role="button"
            className="text-decoration-none hover-text-dark"
            onClick={() => navigate("/signup")}
          >
            회원가입
          </span>
        </div>
      </div>

      <FindIdModal
        show={showFindIdModal}
        onClose={() => setShowFindIdModal(false)}
      />
    </div>
  );
};

export default Login;
