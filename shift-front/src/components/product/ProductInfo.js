import React from "react";

const ProductInfo = ({ name, price, seller, stock }) => {
  return (
    <div className="mb-5 pb-4 border-bottom">
      {/* 상품명 */}
      <h2 className="fw-bold mb-3" style={{ lineHeight: "1.3" }}>
        {name}
      </h2>

      {/* 가격 강조 */}
      <div
        className="fw-bold mb-3"
        style={{
          fontSize: "26px",
          color: "#111",
        }}
      >
        {price.toLocaleString()}원
      </div>

      {/* 판매자 / 재고 */}
      <div
        className="d-flex flex-column text-muted"
        style={{ fontSize: "14px", gap: "4px" }}
      >
        <span>판매자: {seller || "-"}</span>
        <span>재고: {stock}개</span>
      </div>
    </div>
  );
};

export default ProductInfo;

