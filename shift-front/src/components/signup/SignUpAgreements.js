import React from 'react';
import { Form, Button } from 'react-bootstrap';

const SignUpAgreements = ({ agreements, onToggle, onToggleAll, onShowModal }) => {
  return (
    <div className="mb-4 mt-4">
      <div className="border rounded p-3 mb-3 bg-light">
        <Form.Check 
          type="checkbox"
          id="check-all"
          label="모든 약관에 동의합니다"
          checked={agreements.terms && agreements.privacy && agreements.marketing}
          onChange={onToggleAll}
          className="fw-bold"
        />
      </div>
      
      <div className="ps-2 d-flex flex-column gap-2">
        {[
          { id: 'terms', label: '(필수) 서비스 이용약관' },
          { id: 'privacy', label: '(필수) 개인정보 수집 및 이용' },
          { id: 'marketing', label: '(선택) 마케팅 정보 수신' }
        ].map(({ id, label }) => (
          <div key={id} className="d-flex justify-content-between align-items-center">
            <Form.Check 
              type="checkbox"
              id={`check-${id}`}
              label={label}
              checked={agreements[id]}
              onChange={() => onToggle(id)}
              className="small text-secondary"
            />
            <Button 
              variant="link" 
              className="text-secondary text-decoration-underline p-0 small"
              style={{ fontSize: '0.8rem' }}
              onClick={() => onShowModal(id)}
            >
              보기
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SignUpAgreements;