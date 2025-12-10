import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Image } from "react-bootstrap";
import { BsCart } from "react-icons/bs";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../../components/common/MainLayout";
import FixedBottomButton from "../../components/common/FixedBottomButton";
import { resolveProductImage } from "../../utils/productImages";

import { addCartItem } from "../../api/cartApi";
import { getProductDetail, getProductReviews } from "../../api/productApi";

import { useSelector } from "react-redux";

import ProductDescriptionSection from "../../components/product/ProductDescriptionSection";
import ProductReviewSection from "../../components/product/ProductReviewSection";
import AddToCartModal from "../../components/product/AddToCartModal";

import {
  PRODUCT_MAIN_IMG,
  PRODUCT_DESC_IMG,
} from "../../utils/productImages";

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const chatroomId = useSelector(
    (state) => state.chat?.currentRoomId ?? null
  );

  // 리뷰 탭에서 왔는지 확인
  const fromReviewsTab = location.state?.from === "mypage-reviews";

  // Gift Flow
  const isChatGiftMode = window.SHIFT_GIFT_FROM_CHAT === true;
  const isFriendGiftMode =
    typeof window !== "undefined" && window.SHIFT_GIFT_FROM_FRIEND === true;

  const giftContext = location.state || {};
  const isGiftFromState = giftContext.isGift === true;
  const receiverIdFromState = giftContext.receiverId ?? null;
  const receiverNameFromState = giftContext.receiverName ?? null;

  const receiverId =
    receiverIdFromState ??
    (typeof window !== "undefined" ? window.SHIFT_RECEIVER_ID ?? null : null);

  const receiverName =
    receiverNameFromState ??
    (typeof window !== "undefined" ? window.SHIFT_RECEIVER_NAME ?? null : null);

  const isGiftOnlyMode = isChatGiftMode || isFriendGiftMode || isGiftFromState;

  useEffect(() => {
    loadProductDetail();
    loadReviews();
  }, [productId]);

  /** 상품 상세 조회 */
  const loadProductDetail = async () => {
    try {
      const data = await getProductDetail(productId);
      setProduct(data);
    } catch (e) {
      console.error("상품 상세 조회 실패", e);
    }
  };

  /** 리뷰 조회 */
  const loadReviews = async () => {
    try {
      const data = await getProductReviews(productId);
      setReviews(data);
    } catch (e) {
      console.error("리뷰 조회 실패", e);
      setReviews([]);
    }
  };

  /** 바로 구매 */
  const handleBuyNow = () => {
    if (!product) return;

    const rawImage =
      product.imageUrl ||
      product.image ||
      (Array.isArray(product.imageUrls) && product.imageUrls.length > 0
        ? product.imageUrls[0]
        : null);

    const itemForCheckout = {
      productId: product.productId ?? Number(productId),
      name: product.productName,
      price: product.price,
      quantity: 1,
      imageUrl: resolveProductImage(rawImage),
    };

    navigate("/checkout", {
      state: {
        items: [itemForCheckout],
        isGift: false,
      },
    });
  };

  /** 선물하기 */
  const handleGift = () => {
    if (!product) return;

    const rawImage =
      product.imageUrl ||
      product.image ||
      (Array.isArray(product.imageUrls) && product.imageUrls.length > 0
        ? product.imageUrls[0]
        : null);

    const giftItem = {
      productId: product.productId ?? Number(productId),
      name: product.productName,
      price: product.price,
      quantity: 1,
      imageUrl: resolveProductImage(rawImage),
    };

    if (isGiftOnlyMode) {
      navigate("/checkout", {
        state: {
          items: [giftItem],
          isGift: true,
          receiverId,
          receiverName,
        },
      });
    } else {
      navigate("/gift/select-receiver", {
        state: {
          items: [giftItem],
          isGift: true,
        },
      });
    }
  };

  /** 장바구니 */
  const handleAddToCart = async () => {
    if (!product) return;

    try {
      const result = await addCartItem({
        productId: Number(productId),
        quantity: 1,
      });

      if (result?.result === true) {
        setShowModal(true);
      } else {
        alert("장바구니 담기에 실패했습니다.");
      }
    } catch (e) {
      console.error("장바구니 담기 실패", e);
      alert("장바구니 담기 중 오류가 발생했습니다.");
    }
  };

  if (!product) return null;

  const rawImage =
      product.image ||
      product.imageUrl ||
      (product.imageUrls && product.imageUrls.length > 0
        ? product.imageUrls[0]
        : null);
    
      const image = resolveProductImage(rawImage);
  const descriptionImages = [PRODUCT_DESC_IMG];

  return (
    <>
      <MainLayout maxWidth="800px">
        <Container className="py-4">

          {/* 리뷰 탭에서 진입한 경우에만 표시 */}
          {fromReviewsTab && (
            <Button
              variant="link"
              className="mb-4 p-0 text-decoration-none"
              onClick={() =>
                navigate("/mypage", { state: { activeTab: "reviews" } })
              }
            >
              ← 리뷰 목록으로 돌아가기
            </Button>
          )}

          {/* 대표 이미지 */}
          <div
            className="rounded-4 overflow-hidden mb-4 border bg-light"
            style={{ width: "100%", aspectRatio: "1 / 1" }}
          >
            <Image
              src={image}
              fluid
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* 상품 정보 */}
          <div className="mb-5 pb-4 border-bottom">
            <h2 className="fw-bold mb-2">{product.productName}</h2>

            <h3 className="fw-bold text-dark mb-2">
              {product.price.toLocaleString()}원
            </h3>

            <div className="text-muted" style={{ fontSize: "14px" }}>
              판매자: {product.seller || "-"} · 재고: {product.stock}개
            </div>
          </div>

          {/* 설명 이미지 */}
          <ProductDescriptionSection images={descriptionImages} />

          {/* 리뷰 */}
          <ProductReviewSection reviews={reviews} />
        </Container>
      </MainLayout>

      {/* 하단 버튼 */}
      <FixedBottomButton width="800px">
        <Row className="g-2">
          <Col xs={isGiftOnlyMode ? 6 : 4}>
            <Button
              variant="outline-dark"
              className="w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
              onClick={handleAddToCart}
            >
              <BsCart size={20} /> 장바구니
            </Button>
          </Col>

          <Col xs={isGiftOnlyMode ? 6 : 4}>
            <Button
              className="w-100 py-3 fw-bold gift-btn"
              onClick={handleGift}
            >
              {isChatGiftMode ? "선물구매하기" : "선물하기"}
            </Button>
          </Col>

          {!isGiftOnlyMode && (
            <Col xs={4}>
              <Button
                variant="dark"
                className="w-100 py-3 fw-bold"
                onClick={handleBuyNow}
              >
                구매하기
              </Button>
            </Col>
          )}
        </Row>
      </FixedBottomButton>

      {/* 장바구니 모달 */}
      <AddToCartModal
        show={showModal}
        onConfirm={() =>
          navigate("/cart", {
            state: {
              isGiftCart: isGiftOnlyMode,
              receiverId,
              receiverName,
            },
          })
        }
        onCancel={() => setShowModal(false)}
      />
    </>
  );
};

export default ProductDetail;
