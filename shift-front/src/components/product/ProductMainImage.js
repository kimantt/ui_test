import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/common/MainLayout";
import axios from "axios";
import ProductCard from "../../components/product/ProductCard";

const ShopMain = () => {
  const navigate = useNavigate();
  const [latest, setLatest] = useState([]);
  const [cat1Reco, setCat1Reco] = useState([]);
  const [cat2Reco, setCat2Reco] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const safeGetItems = (res) => {
    if (Array.isArray(res.data?.items)) return res.data.items;
    if (Array.isArray(res.data)) return res.data;
    return [];
  };

  const loadData = async () => {
    try {
      const latestRes = await axios.get("http://localhost:8080/products/sort", {
        params: { sortType: "latest" },
      });
      const latestArr = safeGetItems(latestRes).slice(0, 8);
      const latestIds = latestArr.map((p) => p.productId);

      const cat1Res = await axios.get("http://localhost:8080/categories/1/products");
      let cat1List = safeGetItems(cat1Res).filter(
        (item) => !latestIds.includes(item.productId)
      );
      cat1List = cat1List.slice(0, 4);

      const cat2Res = await axios.get("http://localhost:8080/categories/2/products");
      let cat2List = safeGetItems(cat2Res).filter(
        (item) => !latestIds.includes(item.productId)
      );
      cat2List = cat2List.slice(0, 4);

      setLatest(latestArr);
      setCat1Reco(cat1List);
      setCat2Reco(cat2List);
    } catch (err) {
      console.error("메인 데이터 로드 실패:", err);
    }
  };

  const renderProductCard = (p) => {
    if (!p?.productId) return null;

    return (
      <Col key={p.productId} xs={6} md={3} className="mb-4">
        <ProductCard
          product={p}
          onClick={() => navigate(`/product/${p.productId}`)}
        />
      </Col>
    );
  };

  return (
    <MainLayout maxWidth="1000px">
      <Container className="py-4">
        <div className="bg-light rounded-3 p-5 mb-5 text-center border">
          <h2 className="fw-bold mb-2">Shift</h2>
          <p className="text-muted">마음을 전하는 가장 쉬운 방법</p>
        </div>

        <h4 className="fw-bold mb-3 text-center">— 신상품 —</h4>
        <Row className="g-3">{latest.map(renderProductCard)}</Row>

        <h4 className="fw-bold mt-5 mb-3 text-center">— 카테고리 추천 —</h4>

        <h5 className="fw-bold mt-3 mb-2">디퓨저/캔들</h5>
        <Row className="g-3 mb-4">{cat1Reco.map(renderProductCard)}</Row>

        <h5 className="fw-bold mt-4 mb-2">화병/트레이</h5>
        <Row className="g-3">{cat2Reco.map(renderProductCard)}</Row>
      </Container>
    </MainLayout>
  );
};

export default ShopMain;