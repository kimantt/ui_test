import React from "react";
import { Button } from "react-bootstrap";
import { BsArrowLeft } from "react-icons/bs";
import "../../styles/header.css";

const BackHeader = ({ title, onBack }) => {
  return (
    <div className="back-header-container">
      <Button variant="link" className="p-0 text-dark" onClick={onBack}>
        <BsArrowLeft size={24} />
      </Button>
      {title && <h5 className="back-header-title">{title}</h5>}
    </div>
  );
};

export default BackHeader;