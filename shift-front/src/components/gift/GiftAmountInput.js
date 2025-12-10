import React from "react";
import { Button, Form } from "react-bootstrap";
import "../../styles/gift.css";

const GiftAmountInput = ({ value, onChange, onSubmit }) => {
  return (
    <div className="gift-input-wrapper">
      <Form.Control
        type="number"
        placeholder="직접 입력"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <Button variant="dark" className="gift-input-btn" onClick={onSubmit}>
        입력
      </Button>
    </div>
  );
};

export default GiftAmountInput;