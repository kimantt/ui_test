import React from "react";
import { Image } from "react-bootstrap";

const wrapperStyle = {
  width: "100%",
  background: "#fff",
  borderRadius: "12px",
  border: "1px solid #eee",
  overflow: "hidden",
  marginBottom: "24px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
};

const ProductDescriptionSection = ({ images }) => {
  return (
    <div className="mb-5 pb-4 border-bottom">
      <h5 className="fw-bold mb-4">상품 설명</h5>

      {images?.length > 0 ? (
        images.map((img, idx) => (
          <div key={idx} style={wrapperStyle}>
            <Image
              src={img}
              fluid
              style={{
                width: "100%",
                height: "auto",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>
        ))
      ) : (
        <div
          style={{
            ...wrapperStyle,
            aspectRatio: "3 / 4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#999",
            fontSize: "14px",
          }}
        >
          상세 이미지가 없습니다.
        </div>
      )}
    </div>
  );
};

export default ProductDescriptionSection;
