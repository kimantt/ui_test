export const validateLoginId = (loginId) => {
  if (!loginId || loginId.trim() === '') {
    return '아이디를 입력해주세요.';
  }
  if (loginId.length < 4 || loginId.length > 20) {
    return '아이디는 4자 이상 20자 이하로 설정해야 합니다.';
  }
  if (!loginId.match(/^[A-Za-z0-9]+$/)) {
    return '아이디는 영문과 숫자만 사용할 수 있습니다.';
  }
  if (loginId.toLowerCase().startsWith('deleted')) {
    return "'deleted'로 시작하는 ID는 사용할 수 없습니다.";
  }
  return '';
};

export const validateName = (name) => {
  if (!name || name.trim() === '') {
    return '이름을 입력해야 합니다.';
  }
  if (name.length < 2 || name.length > 6) {
    return '이름은 2자 이상 6자 이하로 입력해야 합니다.';
  }
  if (!name.match(/^[가-힣\s]+$/)) {
    return '이름은 한글만 사용할 수 있습니다.';
  }
  return '';
};

export const validatePhone = (phone) => {
  if (!phone || phone.trim() === '') {
    return '연락처를 입력해주세요.';
  }
  const cleanPhone = phone.replace(/-/g, '');
  if (!cleanPhone.match(/^[0-9]{11}$/)) {
    return '연락처는 11자리 숫자만 입력 가능합니다.';
  }
  return '';
};

export const validatePassword = (password) => {
  if (!password || password === '') {
    return '비밀번호를 입력해야 합니다.';
  }
  if (password.length < 8 || password.length > 24) {
    return '비밀번호는 8자 이상 24자 이하로 설정해야 합니다.';
  }
  if (!password.match(/^[A-Za-z0-9!@#$%^&*()]+$/)) {
    return '비밀번호는 영문, 숫자, 특수문자만 사용할 수 있습니다.';
  }
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()]/.test(password);
  
  if (!hasUpperCase || !hasLowerCase || !hasDigit || !hasSpecialChar) {
    return '비밀번호는 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 이상 포함해야 합니다.';
  }
  return '';
};

export const validateAddress = (address) => {
  if (!address || address.trim() === '') {
    return '주소를 입력해주세요.';
  }
  return '';
};

export const formatPhoneNumber = (value) => {
  const numbers = value.replace(/[^0-9]/g, '');
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
};