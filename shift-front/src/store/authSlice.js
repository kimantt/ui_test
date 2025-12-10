import { createSlice } from "@reduxjs/toolkit";
import { storage } from "../utils/storage";

const initialState = {
  isLoggedIn: false,
  accessToken: null,
  userInfo: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // 로그인 성공 시 상태 업데이트
    loginSuccess: (state, action) => {
      state.isLoggedIn = true;
      state.accessToken = action.payload.accessToken;
    },
    // 로그아웃 성공 시 상태 업데이트
    logout: (state) => {
      state.isLoggedIn = false;
      state.accessToken = null;
      state.userInfo = null;
      storage.removeToken();
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
