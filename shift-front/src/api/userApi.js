import httpClient from "./httpClient";

/**
 * 아이디 중복 확인
 * POST /users/check
 * Body: { loginId: string }
 * Response: { available: boolean, message: string }
 */
export const checkLoginIdDuplicate = async (loginId) => {
  const res = await httpClient.post("/users/check", { loginId });
  // available이 true면 사용 가능, false면 중복
  return !res.data.available;  // 중복 여부로 반환 (true = 중복됨)
};

/**
 * 연락처 중복 확인
 * POST /users/check/phone
 * Body: { phone: string }
 * Response: { available: boolean, message: string }
 */
export const checkPhoneDuplicate = async (phone) => {
  const res = await httpClient.post("/users/check/phone", { phone });
  // available이 true면 사용 가능, false면 중복
  return !res.data.available;  // 중복 여부로 반환 (true = 중복됨)
};

/**
 * 비밀번호 규칙 검증
 * POST /users/check/pw-rule
 * Body: { password: string }
 * Response: { valid: boolean, message: string }
 */
export const validatePasswordRule = async (password) => {
  const res = await httpClient.post("/users/check/pw-rule", { password });
  return res.data;  // { valid: true/false, message: "..." }
};

/**
 * 회원가입
 * POST /users
 * Body: {
 *   loginId: string,
 *   password: string,
 *   name: string,
 *   phone: string,
 *   address: string,
 *   termsAgreed: boolean
 * }
 * Response: "회원가입 성공. 할당된 사용자 ID:1" (문자열)
 * 에러: { message: "..." } 또는 문자열
 */
export const registerUser = async (userData) => {
  const res = await httpClient.post("/users", userData);
  return res.data;  // 성공 메시지 문자열
};

export const findUserId = async ({ name, phone }) => {
  const response = await httpClient.post("/users/find-id", { name, phone });
  return response.data;
};

/**
 * 내 정보 조회 (포인트 포함)
 * GET /users/me
 * Response 예시:
 * {
 *   "id": 1,
 *   "name": "홍길동",
 *   "points": 15000,
 *   ...
 * }
 */
export const getMyInfo = async () => {
  const res = await httpClient.get("/users/me");
  return res.data;   // { id, name, points, ... }
};

/**
 * SHOP-011
 * 사용자 포인트 사용/적립 내역 조회
 * GET /users/{userId}/points
 *
 * Response 예시:
 * [
 *   { transactionId: 1, type: 'A', amount: 10000, createdAt: '2025-11-01' },
 *   { transactionId: 2, type: 'U', amount: 5000, createdAt: '2025-11-02' }
 * ]
 */
export const getUserPointHistory = async (userId) => {
  const res = await httpClient.get(`/users/${userId}/points`);
  return res.data;
};


/**
 * 내 정보 수정
 * PUT /users/info
 * Body: { name, phone, address } (변경할 정보 전체)
 */
export const updateUserInfo = async (userData) => {
  const res = await httpClient.put("/users/info", userData);
  return res.data; // 수정된 UserDTO 반환
};

/**
 * 내 포인트 조회 (별도 조회 필요 시)
 * GET /users/points
 * Response: { points: 15000 }
 */
export const getMyPoints = async () => {
  const res = await httpClient.get("/users/points");
  return res.data; 
};

/**
 * 비밀번호 확인 (회원탈퇴용)
 * POST /users/check/password
 * Body: { password: string }
 * Response: { valid: boolean, message: string }
 */
export const verifyPassword = async (password) => {
  try {
    const response = await httpClient.post('/users/check/password', { password });
    return response.data.valid;
  } catch (error) {
    console.error('비밀번호 확인 실패:', error);
    throw error;
  }
};

/**
 * 회원 탈퇴
 * DELETE /users
 * Response: string ("회원 탈퇴가 성공적으로 처리되었습니다.")
 */
export const withdrawUser = async () => {
  try {
    const response = await httpClient.delete('/users');
    return response.data;
  } catch (error) {
    console.error('회원탈퇴 실패:', error);
    throw error;
  }
};