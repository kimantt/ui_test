import React, { useState } from "react";
import { Container, Button, Row, Col, Card } from "react-bootstrap";
import { BsArrowLeft, BsWallet2 } from "react-icons/bs";
import MainLayout from "../../components/common/MainLayout";

const ReceiverSelection = ({ onNavigate }) => {
  const budget = 50000;
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    "All",
    "Electronics",
    "Fashion",
    "Lifestyle",
    "Home",
    "Stationery",
  ];

  const products = [
    {
      id: 1,
      name: "Premium Wireless Headphones",
      price: 45000,
      category: "Electronics",
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
    },
    {
      id: 2,
      name: "Minimalist Leather Wallet",
      price: 38000,
      category: "Fashion",
      image:
        "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80",
    },
    {
      id: 3,
      name: "Stainless Steel Water Bottle",
      price: 25000,
      category: "Lifestyle",
      image:
        "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80",
    },
    {
      id: 4,
      name: "Scented Candle Set",
      price: 32000,
      category: "Home",
      image:
        "https://images.unsplash.com/photo-1602874801006-96e3983d151a?w=400&q=80",
    },
    {
      id: 5,
      name: "Notebook & Pen Set",
      price: 28000,
      category: "Stationery",
      image:
        "https://images.unsplash.com/photo-1517971129774-8a2b38fa128e?w=400&q=80",
    },
    {
      id: 6,
      name: "Bluetooth Speaker",
      price: 48000,
      category: "Electronics",
      image:
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80",
    },
  ];

  const filteredProducts = products.filter(
    (p) =>
      (selectedCategory === "All" || p.category === selectedCategory) &&
      p.price <= budget
  );

  return (
    <>
      <MainLayout maxWidth="900px">
        {/* 자체 Header */}
        <div className="px-4 py-3 border-bottom bg-white d-flex align-items-center">
          <Button
            variant="link"
            className="text-dark p-0"
            onClick={() => onNavigate("shop-main")}
          >
            <BsArrowLeft size={24} />
          </Button>
          <h5 className="m-0 ms-3 fw-bold">선물 선택</h5>
        </div>

        {/* 예산 배너 */}
        <div className="bg-white border-bottom p-5 text-center">
          <div className="d-flex align-items-center justify-content-center gap-2 mb-2 text-secondary">
            <BsWallet2 />
            <span className="small">Gift Budget</span>
          </div>
          <h2 className="display-6 fw-bold mb-2">
            {budget.toLocaleString()} KRW
          </h2>
          <p className="text-muted small m-0">
            원하는 상품을 골라보세요. 남은 금액은 월렛에 적립됩니다!
          </p>
        </div>

        {/* 카테고리 버튼 */}
        <div className="px-4 py-3 border-bottom bg-white d-flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "dark" : "outline-secondary"}
              size="sm"
              className="rounded-pill px-3"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* 상품 그리드 */}
        <Container className="py-4 bg-light flex-grow-1 rounded-3">
          <Row xs={2} md={3} lg={4} className="g-4">
            {filteredProducts.map((product) => (
              <Col key={product.id}>
                <Card
                  className="h-100 border-0 shadow-sm overflow-hidden cursor-pointer"
                  role="button"
                  onClick={() => onNavigate("receiver-checkout")}
                >
                  <div className="bg-white">
                    <Card.Img
                      variant="top"
                      src={product.image}
                      style={{
                        height: "200px",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <Card.Body className="p-3">
                    <div className="small text-secondary mb-1">
                      {product.category}
                    </div>
                    <Card.Title className="fs-6 mb-1 text-truncate">
                      {product.name}
                    </Card.Title>
                    <Card.Text className="fw-bold small">
                      {product.price.toLocaleString()} KRW
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {filteredProducts.length === 0 && (
            <div className="text-center py-5 text-muted">
              선택 가능한 상품이 없습니다.
            </div>
          )}
        </Container>
      </MainLayout>
    </>
  );
};

export default ReceiverSelection;