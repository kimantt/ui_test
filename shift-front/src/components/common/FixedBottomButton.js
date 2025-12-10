import React from "react";
import { Container } from "react-bootstrap";
import "../../styles/layout.css";

const FixedBottomButton = ({ children, width = "800px" }) => {
  return (
    <div className="fixed-bottom-wrapper">
      <Container style={{ maxWidth: width }}>{children}</Container>
    </div>
  );
};

export default FixedBottomButton;