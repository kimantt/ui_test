const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://shift-main-images.s3.ap-northeast-3.amazonaws.com";

export const PRODUCT_MAIN_IMG = `${API_BASE_URL}/products/product_main.jpg`;
export const PRODUCT_DESC_IMG = `${API_BASE_URL}/products/product_desc.jpg`;
export const POINT_IMG = `${API_BASE_URL}/products/point_banner.jpg`;
export const PROFILE_DEFAULT = `${API_BASE_URL}/profile_default.png`;

export const resolveProductImage = (path) => {
  if (!path) return "/no-image.png"; // 리액트 public/no-image.png

  // 이미 완전한 URL이면 그대로 사용
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // DB에 "/products/파일명" 형식으로 들어오는 경우
  if (path.startsWith("/")) {
    return `${API_BASE_URL}${path}`; // -> https://.../products/파일명
  }

  // "products/파일명" 처럼 앞에 / 없는 경우까지 커버
  return `${API_BASE_URL}/${path}`;
};