import React from "react";
import { Card, Image, Button, Form } from "react-bootstrap";
import { BsDash, BsPlus, BsXLg } from "react-icons/bs";
import "../../styles/product.css";
import { resolveProductImage } from "../../utils/productImages";


const OrderItemCard = ({
  item,
  isChecked,
  onToggleCheck,
  onRemove,
  onIncrease,
  onDecrease,
}) => {
  return (
    <Card className="order-item-card shadow-sm border-0">
      <Card.Body className="d-flex gap-3 align-items-start">

        {/* 체크박스 */}
        <Form.Check
          type="checkbox"
          checked={isChecked}
          onChange={() => onToggleCheck(item.id)}
          className="mt-1"
        />

        {/* 이미지 */}
        <div
          className="rounded border bg-light"
          style={{ width: "80px", height: "80px" }}
        >
          <Image
            src={resolveProductImage(item.image)}
            className="w-100 h-100 object-fit-cover rounded"
          />
        </div>

        {/* 상품 정보 영역 */}
        <div className="flex-grow-1">

          {/* 상품명 + 삭제 버튼 */}
          <div className="d-flex justify-content-between">
            <h6 className="mb-1">{item.name}</h6>
            <Button
              variant="link"
              className="text-muted p-0"
              onClick={() => onRemove(item.id)}
            >
              <BsXLg size={18} />
            </Button>
          </div>

          {/* 가격 */}
          <div className="fw-bold mb-2">
            {item.price.toLocaleString()}원
          </div>

          {/* 수량 조절 */}
          <div className="d-flex align-items-center gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => onDecrease(item.id)}
            >
              <BsDash />
            </Button>

            <span>{item.quantity}</span>

            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => onIncrease(item.id)}
            >
              <BsPlus />
            </Button>
          </div>
        </div>

      </Card.Body>
    </Card>
  );
};

export default OrderItemCard;
