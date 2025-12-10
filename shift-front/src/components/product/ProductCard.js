import React from "react";
import { Card } from "react-bootstrap";
import "../../styles/product.css";
import { resolveProductImage } from "../../utils/productImages";
import { PRODUCT_MAIN_IMG } from "../../utils/productImages";

const ProductCard = ({ product, onClick }) => {
  // ----- 데이터 정규화 -----
  const name = product.name || product.productName || "상품명 없음";

   const rawImage =
    product.image ||
    product.imageUrl ||
    (product.imageUrls && product.imageUrls.length > 0
      ? product.imageUrls[0]
      : null);
  
    const image = resolveProductImage(rawImage);
   
  console.log("ProductCard image check >>>", product, image);


  return (
    <Card className="product-card" onClick={onClick}>
      <div className="product-img-wrapper">
        <Card.Img variant="top" src={image} className="product-img" />
      </div>

      <Card.Body className="p-3">
        <Card.Title className="product-title">{name}</Card.Title>

        <Card.Text className="product-price">
          {product.price?.toLocaleString()}원
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
