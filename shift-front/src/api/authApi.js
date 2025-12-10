import httpClient from "./httpClient";

// 로그인
export const loginUser = async (credentials) => {
  const response = await httpClient.post("/auth/login", credentials);
  return response.data;
};

// 로그아웃
export const logoutUser = async () => {
  const response = await httpClient.post("/auth/logout");
  return response.data;
};
