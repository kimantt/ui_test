import React from 'react';
import { Form, Button } from 'react-bootstrap';

const SignUpFormFields = ({
  formData,
  errors,
  verified,
  onChange,
  onCheckLoginId,
  onCheckPhone,
  onSearchAddress
}) => {
  return (
    <>
      {/* 아이디 입력 */}
      <Form.Group className="mb-3" controlId="formLoginId">
        <Form.Label className="small text-secondary">
          아이디 <span className="text-danger">*</span>
        </Form.Label>
        <Form.Control
          type="text"
          name="loginId"
          placeholder="아이디를 입력하세요"
          value={formData.loginId}
          onChange={onChange}
          className={`py-3 border-2 shadow-none ${errors.loginId ? 'is-invalid' : verified.loginId ? 'is-valid' : ''}`}
          style={{ borderColor: "#eee" }}
        />
        <Form.Control.Feedback type="invalid" className="small">
          {errors.loginId}
        </Form.Control.Feedback>
        <Form.Control.Feedback type="valid" className="small">
          사용 가능한 아이디입니다
        </Form.Control.Feedback>
        <Button 
          variant={verified.loginId ? "success" : "outline-dark"}
          className="w-100 mt-2"
          onClick={onCheckLoginId}
          disabled={verified.loginId}
        >
          {verified.loginId ? '확인완료 ✓' : '중복확인'}
        </Button>
      </Form.Group>

      {/* 비밀번호 입력 */}
      <Form.Group className="mb-3" controlId="formPassword">
        <Form.Label className="small text-secondary">
          비밀번호 <span className="text-danger">*</span>
        </Form.Label>
        <Form.Control
          type="password"
          name="password"
          placeholder="비밀번호를 입력하세요"
          value={formData.password}
          onChange={onChange}
          className={`py-3 border-2 shadow-none ${errors.password ? 'is-invalid' : ''}`}
          style={{ borderColor: "#eee" }}
        />
        <Form.Control.Feedback type="invalid" className="small">
          {errors.password}
        </Form.Control.Feedback>
      </Form.Group>

      {/* 비밀번호 확인 */}
      <Form.Group className="mb-3" controlId="formConfirmPassword">
        <Form.Label className="small text-secondary">
          비밀번호 확인 <span className="text-danger">*</span>
        </Form.Label>
        <Form.Control
          type="password"
          name="confirmPassword"
          placeholder="비밀번호를 다시 입력하세요"
          value={formData.confirmPassword}
          onChange={onChange}
          className={`py-3 border-2 shadow-none ${errors.confirmPassword ? 'is-invalid' : ''}`}
          style={{ borderColor: "#eee" }}
        />
        <Form.Control.Feedback type="invalid" className="small">
          {errors.confirmPassword}
        </Form.Control.Feedback>
      </Form.Group>

      {/* 이름 */}
      <Form.Group className="mb-3" controlId="formName">
        <Form.Label className="small text-secondary">
          이름 <span className="text-danger">*</span>
        </Form.Label>
        <Form.Control
          type="text"
          name="name"
          placeholder="이름을 입력하세요"
          value={formData.name}
          onChange={onChange}
          className={`py-3 border-2 shadow-none ${errors.name ? 'is-invalid' : ''}`}
          style={{ borderColor: "#eee" }}
        />
        <Form.Control.Feedback type="invalid" className="small">
          {errors.name}
        </Form.Control.Feedback>
      </Form.Group>

      {/* 전화번호 */}
      <Form.Group className="mb-3" controlId="formPhone">
        <Form.Label className="small text-secondary">
          전화번호 <span className="text-danger">*</span>
        </Form.Label>
        <Form.Control
          type="tel"
          name="phone"
          placeholder="010-0000-0000"
          value={formData.phone}
          onChange={onChange}
          className={`py-3 border-2 shadow-none ${errors.phone ? 'is-invalid' : verified.phone ? 'is-valid' : ''}`}
          style={{ borderColor: "#eee" }}
          maxLength={13}
        />
        <Form.Control.Feedback type="invalid" className="small">
          {errors.phone}
        </Form.Control.Feedback>
        <Form.Control.Feedback type="valid" className="small">
          사용 가능한 전화번호입니다
        </Form.Control.Feedback>
        <Button 
          variant={verified.phone ? "success" : "outline-dark"}
          className="w-100 mt-2"
          onClick={onCheckPhone}
          disabled={verified.phone}
        >
          {verified.phone ? '확인완료 ✓' : '중복확인'}
        </Button>
      </Form.Group>

      {/* 우편번호 */}
      <Form.Group className="mb-3" controlId="formZipcode">
        <Form.Label className="small text-secondary">
          우편번호 <span className="text-danger">*</span>
        </Form.Label>
        <div className="d-flex gap-2">
          <Form.Control
            type="text"
            name="zipcode"
            placeholder="우편번호"
            value={formData.zipcode}
            readOnly
            className={`py-3 border-2 shadow-none ${errors.zipcode ? 'is-invalid' : ''}`}
            style={{ borderColor: "#eee" }}
          />
          <Button
            variant="outline-dark"
            onClick={onSearchAddress}
            style={{ whiteSpace: 'nowrap' }}
          >
            주소검색
          </Button>
        </div>
        {errors.zipcode && (
          <div className="invalid-feedback d-block small">
            {errors.zipcode}
          </div>
        )}
      </Form.Group>

      {/* 기본주소 */}
      <Form.Group className="mb-3" controlId="formAddress1">
        <Form.Label className="small text-secondary">
          기본주소 <span className="text-danger">*</span>
        </Form.Label>
        <Form.Control
          type="text"
          name="address1"
          placeholder="기본주소"
          value={formData.address1}
          readOnly
          className={`py-3 border-2 shadow-none ${errors.address1 ? 'is-invalid' : ''}`}
          style={{ borderColor: "#eee" }}
        />
        {errors.address1 && (
          <div className="invalid-feedback d-block small">
            {errors.address1}
          </div>
        )}
      </Form.Group>

      {/* 상세주소 */}
      <Form.Group className="mb-3" controlId="formAddress2">
        <Form.Label className="small text-secondary">
          상세주소 <span className="text-danger">*</span>
        </Form.Label>
        <Form.Control
          type="text"
          name="address2"
          placeholder="상세주소를 입력하세요"
          value={formData.address2}
          onChange={onChange}
          className={`py-3 border-2 shadow-none ${errors.address2 ? 'is-invalid' : ''}`}
          style={{ borderColor: "#eee" }}
        />
        <Form.Control.Feedback type="invalid" className="small">
          {errors.address2}
        </Form.Control.Feedback>
      </Form.Group>
    </>
  );
};

export default SignUpFormFields;