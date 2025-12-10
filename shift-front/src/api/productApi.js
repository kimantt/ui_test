import httpClient from "./httpClient";  

// 상품 목록 조회
export const getProducts = async () => {
  const res = await httpClient.get("/products");
  return res.data.items;
};

// 상품 상세 조회 (PROD-002)
// GET /products/{productId}
export const getProductDetail = async (productId) => {
  const res = await httpClient.get(`/products/${productId}`);
  return res.data;
};

// 상품 검색
export const searchProducts = async (keyword) => {
  const res = await httpClient.get(`/products/search?keyword=${keyword}`);
  return res.data;
};

// 상품 상세 페이지 리뷰 조회
// GET /products/{productId}/reviews
export const getProductReviews = async (productId) => {
  const res = await httpClient.get(`/products/${productId}/reviews`);
  return res.data;
};

// 리뷰 API (PROD-009~012)

// 사용자 리뷰 조회 (로그인 필요)
// GET /products/users/reviews
export const getMyReviews = async () => {
  const res = await httpClient.get("/products/users/reviews");
  return res.data;
};

// 리뷰 작성 (로그인 필요)
// POST /products/reviews
export const createReview = async (data) => {
  const res = await httpClient.post("/products/reviews", data);
  return res.data;
};

// 리뷰 삭제 (로그인 필요)
// DELETE /products/reviews/{reviewId}
export const deleteReview = async (reviewId) => {
  const res = await httpClient.delete(`/products/reviews/${reviewId}`);
  return res.data;
};

// 리뷰 수정 (로그인 필요)
// PATCH /products/reviews
export const updateReview = async (data) => {
  const res = await httpClient.patch("/products/reviews", data);
  return res.data;
};

// 리뷰 작성 여부 + 작성 가능 여부 체크 (로그인 필요)
// GET /products/order-items/{orderItemId}/reviews/check
export const checkReviewStatus = async (orderItemId) => {
  const res = await httpClient.get(`/products/order-items/${orderItemId}/reviews/check`);
  return res.data; // { reviewWritten: true/false, reviewAvailable: true/false }
};