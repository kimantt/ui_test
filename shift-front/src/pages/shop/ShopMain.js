import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../../components/common/MainLayout";
import axios from "axios";
import ProductCard from "../../components/product/ProductCard"; // ⭐ 추가됨
import { PRODUCT_MAIN_IMG } from "../../utils/productImages";
import "../../styles/shopMain.css";

const BANNER_BASE =
  "https://shift-main-images.s3.ap-northeast-3.amazonaws.com/products";

const bannerSlides = [
  {
    image: `${BANNER_BASE}/shopmain_banner_02.jpg`,
    title: "투명한 유리 꽃병으로 완성하는 공간",
    subtitle: "아침 햇살을 담은 유리 꽃병으로\n집 안의 분위기를 한 단계 더 올려보세요.",
    productId: 36,
  },
  {
    image: `${BANNER_BASE}/shopmain_banner_01.jpg`,
    title: "오늘 하루, 향으로 기억되다",
    subtitle: "디퓨저와 향초로\n하루의 끝을 더 깊고 편안하게",
    productId: 20,
  },
  {
    image: `${BANNER_BASE}/shopmain_banner_03.jpg`,
    title: "고급 트레이로 완성하는 홈카페",
    subtitle: "트레이 하나로 정돈되는 테이블 위의 작은 여유",
    productId: 41,
  },
];


const ShopMain = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [latest, setLatest] = useState([]); // 신상품 8개
  const [cat1Reco, setCat1Reco] = useState([]); // 카테고리1 4개
  const [cat2Reco, setCat2Reco] = useState([]); // 카테고리2 4개

  const [currentSlide, setCurrentSlide] = useState(0);
  //const [textVisible, setTextVisible] = useState(false);

  const giftContext = location.state || {};

  const resolveProductImage = (p) => {
  // 1) Cart나 다른 API에서 단일 imageUrl로 내려오는 경우도 대비
  if (p.imageUrl) {
    return p.imageUrl;
  }

  // 2) 상품목록/카테고리 목록 API: imageUrls 배열의 첫 번째
  if (Array.isArray(p.imageUrls) && p.imageUrls.length > 0) {
    return p.imageUrls[0];
  }

  // 3) 이미지가 전혀 없으면 기본 썸네일
  return PRODUCT_MAIN_IMG;
};

  useEffect(() => {
    loadData();
  }, []);

  const safeGetItems = (res) => {
    return (
      res.data?.items ??
      res.data?.data?.items ??
      (Array.isArray(res.data) ? res.data : [])
    );
  };

  const loadData = async () => {
    try {
      /** -----------------------------
       * 1) 신상품 8개
       * ----------------------------- */
      const latestRes = await axios.get("http://localhost:8080/products/sort", {
        params: { sortType: "latest" },
      });

      const latestArr = safeGetItems(latestRes).slice(0, 8);
      const latestIds = latestArr.map((p) => p.productId);

      /** -----------------------------
       * 2) 카테고리 1
       * ----------------------------- */
      const cat1Res = await axios.get(
        "http://localhost:8080/categories/1/products"
      );
      let cat1List = safeGetItems(cat1Res).filter(
        (item) => !latestIds.includes(item.productId)
      );

      // 부족하면 보충
      if (cat1List.length < 4) {
        const allRes = await axios.get("http://localhost:8080/products");
        const allItems = safeGetItems(allRes);

        const more = allItems.filter(
          (item) =>
            item.categoryId === 1 &&
            !latestIds.includes(item.productId) &&
            !cat1List.some((p) => p.productId === item.productId)
        );

        cat1List = [...cat1List, ...more.slice(0, 4 - cat1List.length)];
      }

      cat1List = cat1List.slice(0, 4);

      /** -----------------------------
       * 3) 카테고리 2
       * ----------------------------- */
      const cat2Res = await axios.get(
        "http://localhost:8080/categories/2/products"
      );
      let cat2List = safeGetItems(cat2Res).filter(
        (item) => !latestIds.includes(item.productId)
      );

      // 부족하면 보충
      if (cat2List.length < 4) {
        const allRes = await axios.get("http://localhost:8080/products");
        const allItems = safeGetItems(allRes);

        const more = allItems.filter(
          (item) =>
            item.categoryId === 2 &&
            !latestIds.includes(item.productId) &&
            !cat2List.some((p) => p.productId === item.productId)
        );

        cat2List = [...cat2List, ...more.slice(0, 4 - cat2List.length)];
      }

      cat2List = cat2List.slice(0, 4);

      /** -----------------------------
       * 4) 상태 저장
       * ----------------------------- */
      setLatest(latestArr);
      setCat1Reco(cat1List);
      setCat2Reco(cat2List);

    } catch (err) {
      console.error("메인 데이터 로드 실패:", err);
    }
  };

/** -----------------------------
   * 배너 자동 슬라이드
   * ----------------------------- */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 3000); // 3초 간격

    return () => clearInterval(interval);
  }, []);

  

  const handleDotClick = (index) => {
    setCurrentSlide(index);
  };


  /** -----------------------------
   * ProductCard 렌더링 함수
   * ----------------------------- */
  const renderProductCard = (p) => (
    <Col key={p.productId} xs={6} md={3} className="mb-4">
      <ProductCard
        product={{
          image: resolveProductImage(p),          // ⭐ ProductCard 요구 데이터에 맞춰 변환
          name: p.productName,
          price: p.price,
        }}
        onClick={() => navigate(`/product/${p.productId}`, {
              state: {
              ...giftContext,
            },
          })
        }
      />
    </Col>
  );

  const current = bannerSlides[currentSlide];

  const handleBannerClick = () => {
  const target = bannerSlides[currentSlide];
  if (!target?.productId) return; // productId 없으면 아무 일도 안 함

  navigate(`/product/${target.productId}`, {
    state: {
      ...giftContext, // 선물 플로우 context 유지
    },
  });
};


  return (
    <MainLayout maxWidth="1000px">
      <Container className="py-4">

        {/* ------------------ 상단 배너 슬라이더 ------------------ */}
        <div className="shop-banner-wrapper mb-5">
          <div
            className="shop-banner-slide"
            onClick={handleBannerClick}
            style={{ cursor: "pointer" }}   
          >
          <img
            src={current.image}
            alt={current.title}
            className="shop-banner-image"
          />
          <div
            key={currentSlide}
            className="shop-banner-text"
          >
            <h2 className="shop-banner-title">{current.title}</h2>
            <p className="shop-banner-subtitle">
              {current.subtitle}
            </p>
          </div>
        </div>

          {/* 인디케이터 동그라미 */}
          <div className="shop-banner-dots">
            {bannerSlides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={
                  "shop-banner-dot " +
                  (idx === currentSlide ? "active" : "")
                }
                onClick={() => handleDotClick(idx)}
              />
            ))}
          </div>
        </div>

        {/* ------------------ 신상품 ------------------ */}
        <h4 className="fw-bold mb-3 text-center">— 신상품 —</h4>
        <Row className="g-3">
          {latest.map(renderProductCard)}
        </Row>

        {/* ------------------ 카테고리 추천 ------------------ */}
        <h4 className="fw-bold mt-5 mb-3 text-center">— 카테고리 추천 —</h4>

        <h5 className="fw-bold mt-3 mb-2">디퓨저/캔들</h5>
        <Row className="g-3 mb-4">
          {cat1Reco.map(renderProductCard)}
        </Row>

        <h5 className="fw-bold mt-4 mb-2">화병/트레이</h5>
        <Row className="g-3">
          {cat2Reco.map(renderProductCard)}
        </Row>

      </Container>
    </MainLayout>
  );
};

export default ShopMain;