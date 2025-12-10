import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Alert, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import MainLayout from '../../components/common/MainLayout';
import PasswordConfirmModal from '../../components/user/PasswordConfirmModal';
import PointWarningModal from '../../components/user/PointWarningModal';
import { getMyInfo, verifyPassword, withdrawUser } from '../../api/userApi';

const WithdrawalPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [userInfo, setUserInfo] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // 비밀번호 모달 관련
  const [showPasswordModal, setShowPasswordModal] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  
  // 포인트 경고 모달
  const [showPointWarningModal, setShowPointWarningModal] = useState(false);

  // 사용자 정보 불러오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const data = await getMyInfo();
        setUserInfo(data);
      } catch (error) {
        alert('사용자 정보를 불러오는데 실패했습니다.');
        navigate('/mypage');
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [navigate]);

  // 비밀번호 확인 완료
  const handlePasswordConfirm = async (password) => {
    try {
      const isValid = await verifyPassword(password);
      
      if (isValid) {
        setIsVerified(true);
        setShowPasswordModal(false);
      } else {
        alert('비밀번호가 일치하지 않습니다.');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || '비밀번호 확인에 실패했습니다.';
      alert(errorMsg);
    }
  };

  // 비밀번호 모달 닫기
  const handlePasswordModalClose = () => {
    navigate('/mypage');
  };

  // 회원탈퇴 버튼 클릭
  const handleWithdrawalClick = () => {
    if (!agreed) {
      alert('회원탈퇴에 동의해주세요.');
      return;
    }

    // 포인트가 있으면 경고 모달 표시
    if (userInfo?.points > 0) {
      setShowPointWarningModal(true);
    } else {
      // 포인트가 없으면 바로 탈퇴 확인
      handleWithdrawal();
    }
  };

  // 포인트 경고 모달에서 확인 클릭
  const handlePointWarningConfirm = () => {
    setShowPointWarningModal(false);
    handleWithdrawal();
  };

  // 실제 회원탈퇴 처리
  const handleWithdrawal = async () => {
    if (!window.confirm('정말 탈퇴하시겠습니까?\n탈퇴 후에는 복구할 수 없습니다.')) {
      return;
    }

    try {
      setLoading(true);
      
      // 회원탈퇴 API 호출 (백엔드에서 비밀번호 재확인 불필요)
      await withdrawUser();
      
      alert('회원탈퇴가 완료되었습니다.\n그동안 이용해주셔서 감사합니다.');
      
      // 로그아웃 처리
      dispatch(logout());
      
      // 메인 페이지로 이동
      navigate('/', { replace: true });
      
    } catch (error) {
      // 백엔드 에러 메시지 처리
      let errorMsg = '회원탈퇴에 실패했습니다.';
      
      if (error.response?.data) {
        const data = error.response.data;
        // 문자열로 온 경우
        if (typeof data === 'string') {
          errorMsg = data;
        } 
        // 객체로 온 경우
        else if (data.message) {
          errorMsg = data.message;
        }
      }
      
      // "진행 중인 주문이 있어 탈퇴할 수 없습니다" 같은 메시지
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isVerified) {
    return (
      <MainLayout>
        <Container className="py-5 text-center">로딩중...</Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* 비밀번호 확인 모달 */}
      <PasswordConfirmModal
        show={showPasswordModal}
        onHide={handlePasswordModalClose}
        onConfirm={handlePasswordConfirm}
      />

      {/* 포인트 경고 모달 */}
      <PointWarningModal
        show={showPointWarningModal}
        onHide={() => setShowPointWarningModal(false)}
        onConfirm={handlePointWarningConfirm}
        points={userInfo?.points}
      />

      {/* 회원탈퇴 페이지 본문 */}
      {isVerified && (
        <Container className="py-5" style={{ maxWidth: '600px' }}>
          <div className="text-center mb-4">
            <h2 className="fw-bold">회원 탈퇴</h2>
            <p className="text-muted">신중하게 결정해 주세요</p>
          </div>

          {/* 경고 메시지 */}
          <Alert variant="danger" className="shadow-sm">
            <Alert.Heading className="h5">
              회원탈퇴 시 아래 정보가 모두 삭제됩니다!
            </Alert.Heading>
            <hr />
            <ul className="mb-0 pb-0" style={{ lineHeight: '2' }}>
              <li>회원 정보 및 서비스 이용 기록이 모두 삭제됩니다</li>
              <li><strong className="text-danger">보유하신 포인트는 모두 소멸</strong>되며 복구할 수 없습니다</li>
              <li>진행 중인 주문이나 선물은 모두 취소됩니다</li>
              <li>탈퇴 후 동일한 아이디로 재가입할 수 없습니다</li>
              <li>법령에 따라 일부 정보는 일정 기간 보관될 수 있습니다</li>
            </ul>
          </Alert>

          {/* 회원 정보 표시 */}
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-dark text-white">
              <strong>회원 정보</strong>
            </Card.Header>
            <Card.Body className="p-4">
              <div className="row mb-3">
                <div className="col-4 text-muted fw-semibold">아이디</div>
                <div className="col-8 fw-bold">{userInfo?.loginId || '-'}</div>
              </div>
              <hr className="my-3" />
              <div className="row mb-3">
                <div className="col-4 text-muted fw-semibold">이름</div>
                <div className="col-8">{userInfo?.name || '-'}</div>
              </div>
              <hr className="my-3" />
              <div className="row mb-3">
                <div className="col-4 text-muted fw-semibold">전화번호</div>
                <div className="col-8">{userInfo?.phone || '-'}</div>
              </div>
              <hr className="my-3" />
              <div className="row mb-3">
                <div className="col-4 text-muted fw-semibold">주소</div>
                <div className="col-8">{userInfo?.address || '-'}</div>
              </div>
              <hr className="my-3" />
              <div className="row">
                <div className="col-4 text-muted fw-semibold">보유 포인트</div>
                <div className="col-8">
                  <Badge bg="danger" className="fs-6 py-2 px-3">
                    {userInfo?.points ? userInfo.points.toLocaleString() : '0'} P
                  </Badge>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* 동의 체크박스 */}
          <Card className="mb-4 border-danger shadow-sm">
            <Card.Body>
              <Form.Check
                type="checkbox"
                id="agree-withdrawal"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                label={
                  <span className="ms-2">
                    위 안내사항을 모두 확인하였으며, 
                    <strong className="text-danger"> 회원탈퇴에 동의</strong>합니다
                  </span>
                }
                className="py-2"
              />
            </Card.Body>
          </Card>

          {/* 버튼 */}
          <div className="d-flex gap-3">
            <Button 
              variant="outline-secondary" 
              size="lg" 
              className="flex-fill"
              onClick={() => navigate('/mypage')}
            >
              취소
            </Button>
            <Button 
              variant="danger" 
              size="lg" 
              className="flex-fill"
              onClick={handleWithdrawalClick}
              disabled={!agreed}
            >
              {agreed ? '탈퇴하기' : '동의 후 탈퇴 가능'}
            </Button>
          </div>
        </Container>
      )}
    </MainLayout>
  );
};

export default WithdrawalPage;