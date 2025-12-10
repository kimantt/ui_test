import React, { useEffect, useState } from "react";
import { Container, Button, Spinner, Alert } from "react-bootstrap";
import MainLayout from "../../components/common/MainLayout";
import OrderItemCard from "../../components/order/OrderItemCard";
import FixedBottomButton from "../../components/common/FixedBottomButton";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/checkout.css";
import {
  fetchCartItems,
  updateCartItemQuantity,
  deleteCartItem,
  clearCartByUser,
} from "../../api/cartApi";
import { resolveProductImage } from "../../utils/productImages";



const Cart = () => {

  const [cartItems, setCartItems] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  //  선물 플로우에서 온 장바구니인지 여부
  const isGiftCart = location.state?.isGiftCart === true;
 
  // 이미 선택된 친구(수신자)가 있는지 확인
  const receiverIdFromState = location.state?.receiverId ?? null;
  const receiverIdFromWindow =
    typeof window !== "undefined" ? window.SHIFT_RECEIVER_ID ?? null : null;
  const receiverId = receiverIdFromState ?? receiverIdFromWindow;
  const hasReceiver = !!receiverId;

  const receiverNameFromState = location.state?.receiverName ?? null;
  const receiverNameFromWindow =
    typeof window !== "undefined" ? window.SHIFT_RECEIVER_NAME ?? null : null;
  const receiverName = receiverNameFromState ?? receiverNameFromWindow;

  // 장바구니 목록 조회
  useEffect(() => {
    const loadCart = async () => {
      try {
        setLoading(true);
        const data = await fetchCartItems();
        const items = data.items ?? [];
  console.log("cart items >>>", items);

        setCartItems(items);
        setSelected(items.map((item) => item.cartId)); // 기본 전체 선택
      } catch (e) {
        console.error(e);
        setError("장바구니를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);
 
  // 총 금액
  const total = cartItems.reduce(
    (sum, item) => {
      if (selected.includes(item.cartId)) {
        return sum + item.quantity * item.price;
      }
      return sum;
    },
    0
  );

  // 개별 체크 토글
  const toggleCheck = (id) => {
    if (selected.includes(id))
      setSelected(selected.filter((x) => x !== id));
    else
      setSelected([...selected, id]);
  };

  // 전체 선택/해제
  const toggleAll = () => {
    if (selected.length === cartItems.length){
      setSelected([]);
    } else {
      setSelected(cartItems.map((i) => i.cartId));
    }
  };
  
  // 개별 삭제 (API + 상태 업데이트)
  const removeItem = async (id) => {
    if (!window.confirm("해당 상품을 장바구니에서 삭제하시겠습니까?")) return;

    try {
      await deleteCartItem(id);
      setCartItems(cartItems.filter((item) => item.cartId !== id));
      setSelected(selected.filter((x) => x !== id));
    } catch (e) {
      console.error(e);
      alert("상품 삭제에 실패했습니다.");
    }
  };

 // 선택 삭제 (API 여러 번 호출 + 상태 업데이트)
  const removeSelected = async () => {
    if (selected.length === 0) {
      alert("삭제할 상품을 선택해 주세요.");
      return;
    }

    if (!window.confirm("선택한 상품을 모두 삭제하시겠습니까?")) return;

    try {
      await Promise.all(selected.map((id) => deleteCartItem(id)));

      setCartItems(
        cartItems.filter((item) => !selected.includes(item.cartId))
      );
      setSelected([]);
    } catch (e) {
      console.error(e);
      alert("선택 삭제에 실패했습니다.");
    }
  };
  
  // 수량 변경 공통 함수 (API + 상태 업데이트)
  const changeQuantity = async (id, newQty) => {
    try {
      await updateCartItemQuantity(id, newQty);

      setCartItems(
        cartItems.map((item) =>
          item.cartId === id ? { ...item, quantity: newQty } : item
        )
      );
    } catch (e) {
      console.error(e);
      alert("수량 변경에 실패했습니다.");
    }
  };
  
  // 수량 증가
  const increaseQty = (id) => {
    const item = cartItems.find((i) => i.cartId === id);
    if (!item) return;
    changeQuantity(id, item.quantity + 1);
  };

  // 수량 감소
  const decreaseQty = (id) => {
    const item = cartItems.find((i) => i.cartId === id);
    if (!item || item.quantity <= 1) return;
    changeQuantity(id, item.quantity - 1);
  };

  // 장바구니 전체 비우기
  const clearAll = async () => {
    if (cartItems.length === 0) return;

    if (!window.confirm("장바구니를 모두 비우시겠습니까?")) return;

    try {
      await clearCartByUser();
      setCartItems([]);
      setSelected([]);
    } catch (e) {
      console.error(e);
      alert("장바구니 비우기에 실패했습니다.");
    }
  };

  // 구매하기 (자기 자신에게)
  const handleBuyForSelf = () => {
    const selectedItems = cartItems.filter((item) =>
      selected.includes(item.cartId)
    );

    if (selectedItems.length === 0) {
      alert("구매할 상품을 선택해 주세요.");
      return;
    }

    const itemsForCheckout = selectedItems.map((item) => ({
      productId: item.productId,
      name: item.productName,
      price: item.price,
      quantity: item.quantity,
      imageUrl: item.imageUrl,
    }));

    navigate("/checkout", {
      state: {
        items: itemsForCheckout,
        isGift: false,
      },
    });
  };
  // 선물하기 (친구 선택 페이지로 이동)
  const handleGift = () => {
    const selectedItems = cartItems.filter((item) =>
      selected.includes(item.cartId)
    );

    if (selectedItems.length === 0) {
      alert("선물할 상품을 선택해 주세요.");
      return;
    }

    const itemsForCheckout = selectedItems.map((item) => ({
      productId: item.productId,
      name: item.productName,
      price: item.price,
      quantity: item.quantity,
      imageUrl: item.imageUrl,
    }));

    if (hasReceiver) {
      // 이미 친구를 선택한 상태라면 → 바로 Checkout
      navigate("/checkout", {
        state: {
          items: itemsForCheckout,
          isGift: true,
          receiverId, // 선택했던 친구
          receiverName,
        },
      });
    } else {
      navigate("/gift/select-receiver", {
        state: {
          items: itemsForCheckout,
          isGift: true,
        },
      });
    }
  };

  // 로딩 상태
  if (loading) {
    return (
      <MainLayout maxWidth="800px">
        <div className="d-flex justify-content-center align-items-center min-vh-50">
          <Spinner animation="border" />
        </div>
      </MainLayout>
    );
  }
  // 에러 상태
  if (error) {
    return (
      <MainLayout maxWidth="800px">
        <Container className="py-5">
          <Alert variant="danger">{error}</Alert>
        </Container>
      </MainLayout>
    );
  }

  return (
    <>
      <MainLayout maxWidth="800px">
        <Container className="pb-5">

          <h2 className="fw-bold mb-3">장바구니</h2>

          {/* 전체 선택 및 삭제 */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center gap-2">
              <input
                type="checkbox"
                checked={
                  cartItems.length > 0 &&
                  selected.length === cartItems.length
                }
                onChange={toggleAll}
              />
              <span>전체선택</span>
            </div>
          <div className="d-flex align-items-center gap-3">
            <Button
              variant="link"
              className="text-danger p-0"
              onClick={removeSelected}
            >
              선택삭제
            </Button>
            <Button
            variant="link"
            className="text-secondary p-0"
            onClick={clearAll}
            >
              전체비우기
            </Button>
          </div>
        </div>
          {/* 상품 리스트 */}
          <div className="cart-list">
            {cartItems.length === 0 ? (
              <p className="text-muted">장바구니에 담긴 상품이 없습니다.</p>
            ) : (
              cartItems.map((item) => (
                <OrderItemCard
                  key={item.cartId}
                  item={{
                    id: item.cartId,
                    name: item.productName,
                    price: item.price,
                    quantity: item.quantity,
                    image: resolveProductImage(item.imageUrl),
                  }}
                  isChecked={selected.includes(item.cartId)}
                  onToggleCheck={toggleCheck}
                  onRemove={removeItem}
                  onIncrease={increaseQty}
                  onDecrease={decreaseQty}
                />
            ))
          )}
          </div>

        </Container>
      </MainLayout>

      {/* 하단 고정 결제 버튼 */}
      {cartItems.length > 0 && (
        <FixedBottomButton width="800px">
          <div className="d-flex justify-content-between mb-3">
            <span className="text-secondary">총 결제금액</span>
            <span className="fs-4 fw-bold">
              {total.toLocaleString()}원
            </span>
          </div>


          <div className="d-flex gap-2">
            {!isGiftCart && (
              <button
                className="cart-buy-btn flex-fill"
                onClick={handleBuyForSelf}
              >
                나에게 구매
              </button>
            )}
            <button
              className="cart-buy-btn flex-fill"
              onClick={handleGift}
            >
              선물하기
            </button>
          </div>
        </FixedBottomButton>
    )}
    </>
  );
};

export default Cart;
