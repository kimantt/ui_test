import httpClient from "./httpClient";

/**
 * 장바구니 목록 조회
 * GET /cart?userId={userId}
 * Response 예시:
 * {
 *   "items": [
 *     {
 *       "cartId": 1,
 *       "productId": 1,
 *       "productName": "화이트 머스크 프리미엄 디퓨저 200ml",
 *       "quantity": 1,
 *       "price": 32000,
 *       "imageUrl": "test.jsp"
 *     }
 *   ]
 * }
 */
export const fetchCartItems = async () => {
  const res = await httpClient.get("/cart");
  return res.data; 
};

/**
 * 장바구니 상품 추가
 * POST /cart
 * Body 예시:
 * {
 *   "productId": 3,
 *   "quantity": 2
 * }
 */
export const addCartItem = async ({ productId, quantity }) => {
  const res = await httpClient.post("/cart", {
    productId,
    quantity,
  });
  return res.data;
};

/**
 * 장바구니 수량 변경
 * PATCH /cart/{cartId}
 * Body 예시: { "quantity": 3 }
 */
export const updateCartItemQuantity = async (cartId, quantity) => {
  const res = await httpClient.post(`/cart/${cartId}`, {
    quantity
  });
  return res.data;
};

/**
 * 장바구니 상품 삭제 (개별)
 * DELETE /cart/{cartId}
 */
export const deleteCartItem = async (cartId) => {
  const res = await httpClient.delete(`/cart/${cartId}`);
  return res.data;
};

/**
 * 장바구니 전체 비우기
 * DELETE /cart/all
 */
export const clearCartByUser = async () => {
  const res = await httpClient.delete("/cart/all");
  return res.data;
};