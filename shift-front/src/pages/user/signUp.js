import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import TermsModal from '../../components/user/TermsModal';
import SignUpFormFields from '../../components/signup/SignUpFormFields';
import SignUpAgreements from '../../components/signup/SignUpAgreements';
import { registerUser, checkLoginIdDuplicate, checkPhoneDuplicate } from '../../api/userApi';
import { 
  validateLoginId, validateName, validatePhone, validatePassword, validateAddress, formatPhoneNumber 
} from '../../utils/signUpValidation';

const SignUp = () => {
  const navigate = useNavigate();
  
  // Daum API 스크립트 로드
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.head.appendChild(script);
  }, []);

  const [formData, setFormData] = useState({
    loginId: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    zipcode: '',
    address1: '',
    address2: ''
  });

  const [errors, setErrors] = useState({});
  const [verified, setVerified] = useState({
    loginId: false,
    phone: false
  });
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    marketing: false
  });
  const [modal, setModal] = useState({ isOpen: false, type: null });

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    let finalValue = value;
    if (name === 'phone') {
      finalValue = formatPhoneNumber(value);
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));

    if (name === 'loginId') {
      setVerified(prev => ({ ...prev, loginId: false }));
    }
    if (name === 'phone') {
      setVerified(prev => ({ ...prev, phone: false }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // 아이디 중복확인
  const handleCheckLoginId = async () => {
    const error = validateLoginId(formData.loginId);
    if (error) {
      alert(error);
      setErrors(prev => ({ ...prev, loginId: error }));
      return;
    }

    try {
      const isDuplicate = await checkLoginIdDuplicate(formData.loginId);
      if (isDuplicate) {
        alert('이미 사용 중인 아이디입니다');
        setErrors(prev => ({ ...prev, loginId: '이미 사용 중인 아이디입니다' }));
        setVerified(prev => ({ ...prev, loginId: false }));
      } else {
        alert('사용 가능한 아이디입니다');
        setErrors(prev => ({ ...prev, loginId: '' }));
        setVerified(prev => ({ ...prev, loginId: true }));
      }
    } catch (err) {
      console.error(err);
      alert('아이디 중복 확인에 실패했습니다');
    }
  };

  // 전화번호 중복확인
  const handleCheckPhone = async () => {
    const error = validatePhone(formData.phone);
    if (error) {
      alert(error);
      setErrors(prev => ({ ...prev, phone: error }));
      return;
    }

    try {
      const cleanPhone = formData.phone.replace(/-/g, '');
      const isDuplicate = await checkPhoneDuplicate(cleanPhone);
      if (isDuplicate) {
        alert('이미 사용 중인 전화번호입니다');
        setErrors(prev => ({ ...prev, phone: '이미 사용 중인 전화번호입니다' }));
        setVerified(prev => ({ ...prev, phone: false }));
      } else {
        alert('사용 가능한 전화번호입니다');
        setErrors(prev => ({ ...prev, phone: '' }));
        setVerified(prev => ({ ...prev, phone: true }));
      }
    } catch (err) {
      console.error(err);
      alert('전화번호 중복 확인에 실패했습니다');
    }
  };

  // 주소검색
  const handleSearchAddress = () => {
    new window.daum.Postcode({
      oncomplete: function(data) {
        let address1 = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
        
        setFormData(prev => ({
          ...prev,
          zipcode: data.zonecode,
          address1: address1,
          address2: ''
        }));
        
        setErrors(prev => ({ ...prev, address: '', zipcode: '' }));
        
        setTimeout(() => {
          document.getElementById('formAddress2')?.focus();
        }, 100);
      }
    }).open();
  };

  // 약관 토글
  const toggleAgreement = (field) => {
    setAgreements(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const toggleAllAgreements = () => {
    const allChecked = agreements.terms && agreements.privacy && agreements.marketing;
    setAgreements({ terms: !allChecked, privacy: !allChecked, marketing: !allChecked });
  };

  // 회원가입
  const handleSignUp = async () => {
    if (!verified.loginId) {
      alert('아이디 중복확인을 해주세요');
      return;
    }
    if (!verified.phone) {
      alert('전화번호 중복확인을 해주세요');
      return;
    }
    if (!agreements.terms || !agreements.privacy) {
      alert('필수 약관에 동의해주세요');
      return;
    }
    if (!formData.zipcode || formData.zipcode.trim() === '') {
      setErrors(prev => ({ ...prev, zipcode: '주소검색을 통해 우편번호를 입력해주세요' }));
      alert('주소검색을 통해 우편번호를 입력해주세요');
      return;
    }
    if (!formData.address1 || formData.address1.trim() === '') {
      setErrors(prev => ({ ...prev, address1: '주소검색을 통해 기본주소를 입력해주세요' }));
      alert('주소검색을 통해 기본주소를 입력해주세요');
      return;
    }
    if (!formData.address2 || formData.address2.trim() === '') {
      setErrors(prev => ({ ...prev, address2: '상세주소를 입력해주세요' }));
      alert('상세주소를 입력해주세요');
      return;
    }

    const fullAddress = `${formData.address1} ${formData.address2}`.trim();
    const newErrors = {};
    newErrors.loginId = validateLoginId(formData.loginId);
    newErrors.password = validatePassword(formData.password);
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
    }
    newErrors.name = validateName(formData.name);
    newErrors.phone = validatePhone(formData.phone);
    newErrors.address = validateAddress(fullAddress);

    const hasError = Object.values(newErrors).some(msg => msg !== '');
    if (hasError) {
      setErrors(newErrors);
      alert('입력 항목을 확인해주세요');
      return;
    }

    const requestData = {
      loginId: formData.loginId,
      password: formData.password,
      name: formData.name,
      phone: formData.phone.replace(/-/g, ''),
      address: fullAddress,
      termsAgreed: true
    };

    try {
      const response = await registerUser(requestData);
      console.log('가입 성공:', response);
      alert('회원가입이 완료되었습니다!');
      navigate('/');
    } catch (error) {
      console.error('가입 실패:', error);
      const resData = error.response?.data;
      const serverMsg = (typeof resData === 'object' && resData.message) 
                        ? resData.message 
                        : resData || '회원가입 중 오류가 발생했습니다.';
      alert(serverMsg);
    }
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100 bg-white mx-auto border-start border-end" style={{ maxWidth: "480px" }}>
      {/* 로고 */}
      <div className="mb-4">
        <h1 className="display-4 fw-bold text-dark tracking-tight">Shift</h1>
      </div>

      {/* 폼 */}
      <div className="w-100 px-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <SignUpFormFields
          formData={formData}
          errors={errors}
          verified={verified}
          onChange={handleChange}
          onCheckLoginId={handleCheckLoginId}
          onCheckPhone={handleCheckPhone}
          onSearchAddress={handleSearchAddress}
        />

        <SignUpAgreements
          agreements={agreements}
          onToggle={toggleAgreement}
          onToggleAll={toggleAllAgreements}
          onShowModal={(type) => setModal({ isOpen: true, type })}
        />

        <Button
          className="w-100 py-3 fw-bold mt-4 border-0"
          style={{ backgroundColor: "black", color: "white" }}
          onClick={handleSignUp}
        >
          회원가입
        </Button>
      </div>

      {/* 하단 링크 */}
      <div className="mt-4 small text-secondary">
        <span role="button" className="text-decoration-none hover-text-dark" onClick={() => navigate('/')}>
          이미 계정이 있으신가요? 로그인
        </span>
      </div>

      {/* 약관 모달 */}
      <TermsModal 
        isOpen={modal.isOpen}
        type={modal.type}
        onClose={() => setModal({ isOpen: false, type: null })}
        onAgree={() => {
          if (modal.type) setAgreements(prev => ({ ...prev, [modal.type]: true }));
          setModal({ isOpen: false, type: null });
        }}
      />
    </div>
  );
};

export default SignUp;