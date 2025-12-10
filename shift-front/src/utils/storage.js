import { jwtDecode } from "jwt-decode";

// 토큰 관련 처리를 위한 유틸리티 클래스
class TokenStorage {
  // 로컬스토리지에 엑세스토큰 저장
  setToken(token) {
    localStorage.setItem("accessToken", token);
  }

  // 로컬스토리지에서 엑세스토큰 가져오기
  getToken() {
    return localStorage.getItem("accessToken");
  }

  removeToken() {
    localStorage.removeItem("accessToken");
  }

  // 토큰에서 사용자 ID 추출
  getUserId(token = this.getToken()) {
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.sub || null;
    } catch (error) {
      console.error("Invalid token:", error);
      return null;
    }
  }
}

export const storage = new TokenStorage();
