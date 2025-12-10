import axios from "axios";
import store from "../store/store";
import { loginSuccess, logout } from "../store/authSlice";
import { storage } from "../utils/storage";

const baseURL = "http://localhost:8080"; // 백엔드 서버 주소

// 공통 Axios 인스턴스 생성
const httpClient = axios.create({
  baseURL: baseURL,
  timeout: 10000, // 요청 타임아웃
  withCredentials: true, // 리프레시 토큰 전송을 위한 쿠키 포함
});

// 공통 요청/응답 처리
httpClient.interceptors.request.use(
  (config) => {
    // 로컬스토리지에서 토큰 가져오기
    const token = storage.getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false; // 토큰 갱신 중인지 여부
let refreshSubscribers = []; // 갱신 완료 후 재시도할 요청들

// 갱신이 끝나면 대기 중인 요청들을 재시도
const onRefreshed = (accessToken) => {
  refreshSubscribers.forEach((callback) => callback(accessToken));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 로그인 요청에 대한 오류는 토큰 갱신 시도하지 않음
    if (originalRequest.url === "/auth/login") {
      return Promise.reject(error);
    }

    // 401 오류 발생 시
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(httpClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true; // 재시도 플래그 설정
      isRefreshing = true;

      try {
        console.log("액세스 토큰 만료, 리프레시 토큰으로 갱신 시도");
        const expiredToken = storage.getToken();

        // 리프레시 토큰으로 액세스 토큰 갱신 요청
        const { data } = await axios.post(
          `${baseURL}/auth/refresh`,
          {},
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${expiredToken}`,
            },
          }
        );

        const newAccessToken = data.accessToken;

        // 로컬스토리지에 새로운 액세스 토큰 저장
        storage.setToken(newAccessToken);
        store.dispatch(loginSuccess({ accessToken: newAccessToken })); // Redux 상태 업데이트

        onRefreshed(newAccessToken); // 대기 중인 요청들 재시도

        // 원래 요청에 새로운 액세스 토큰 설정 후 재시도
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return httpClient(originalRequest);
      } catch (refreshError) {
        console.error("토큰 갱신 실패, 로그인 필요:", refreshError);

        storage.removeToken();
        store.dispatch(logout()); // Redux 상태 초기화
        window.location.href = "/"; // 로그인 페이지로 리다이렉트

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default httpClient;
