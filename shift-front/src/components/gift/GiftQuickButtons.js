import React from "react";
import { Button, Row, Col } from "react-bootstrap";
import "../../styles/gift.css";

const GiftQuickButtons = ({ list, onAdd }) => {
  return (
    <Row className="g-2 mb-4">
      {list.map((item) => (
        <Col xs={3} key={item.value}>
          <Button
            variant="outline-secondary"
            className="w-100 py-3"
            onClick={() => onAdd(item.value)}
          >
            {item.label}
          </Button>
        </Col>
      ))}
    </Row>
  );
};

export default GiftQuickButtons;