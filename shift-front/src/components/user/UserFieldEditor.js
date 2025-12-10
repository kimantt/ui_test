// src/components/common/EditableUserInfoCard.js

import React, { useEffect, useState } from "react";
import { Card, Button, FormControl, Spinner, Form } from "react-bootstrap";
// 전화번호 포맷팅 함수 임포트
import { formatPhoneNumber } from '../../utils/signUpValidation';

const EditableUserInfoCard = ({
  title,
  initialValue,
  inputType = "text",
  onSave,
  inputHelperText = null, // 도움말 텍스트를 위한 prop
}) => {
  // 편집 모드 상태
  const [isEditing, setIsEditing] = useState(false);
  // 편집 중인 임시 값
  const [tempValue, setTempValue] = useState(initialValue);
  // 저장 로딩 상태
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(null); // 에러 메시지를 저장할 상태

  // initialValue가 변경될 때마다 tempValue를 동기화 (user 정보가 새로 로드되거나 변경될 때)
  useEffect(() => {
    setTempValue(initialValue);
    setError(null); // 새 값이 로드되면 에러 메시지 초기화
  }, [initialValue]);

  // 입력 변경 핸들러: 전화번호 자동 포맷팅 로직 추가
const handleInputChange = (e) => {
  let value = e.target.value;

  // inputType이 'tel' (연락처)일 경우에만 포맷팅 적용
  if (inputType === 'tel') {
    value = formatPhoneNumber(value);
  }
  
  setTempValue(value);
  
  // 입력 시작하면 기존 에러 메시지 숨김
  if (error) {
      setError(null); 
  }
};

  // 저장 핸들러
  const handleSave = async () => {
    const newValue = tempValue.trim();

    // 유효성 검사: 값이 없거나 기존 값과 동일하면 저장하지 않음
    if (!newValue || newValue === initialValue) {
      handleCancel();
      return;
    }

    setSaveLoading(true);
    setError(null); // 저장 시도 전 에러 초기화
    
    try {
      // 외부에서 전달받은 onSave 함수 호출 (MyPage의 API 호출 로직 실행)
      await onSave(newValue); 
      // 성공적으로 저장되면, MyPage의 user 상태가 업데이트되고 useEffect에 의해 tempValue도 업데이트됨
      setIsEditing(false); // 편집 모드 종료
    } catch (e) {
      // MyPage에서 던진 유효성/중복/API 오류를 여기서 잡고 화면에 표시
      const errorMsg = e.message || `${title} 변경에 실패했습니다.`;
      setError(errorMsg); 
    } finally {
      setSaveLoading(false);
    }
  };

  // 취소 핸들러
  const handleCancel = () => {
    setTempValue(initialValue); // 원래 값으로 복원
    setError(null); // 취소 시 에러 메시지 초기화
    setIsEditing(false); // 편집 모드 종료
  };

  return (
    <Card className="border shadow-sm">
      {/* UI 구조 변경: 에러 메시지와 버튼을 깔끔하게 정렬하기 위해 flex-column으로 변경 */}
      <Card.Body className="d-flex justify-content-between align-items-start p-4 flex-column">
        <div className="w-100">
          <div className="text-muted small mb-1">{title}</div>
          {/* 입력 필드와 버튼을 한 줄에 정렬하기 위한 래퍼 */}
          <div className="d-flex justify-content-between align-items-center">
            {isEditing ? (
              // 편집 모드: 입력창과 에러/도움말 텍스트를 위한 별도 div
              <div className="w-75 me-3"> 
                <FormControl
                  type={inputType}
                  value={tempValue}
                  onChange={handleInputChange} // 입력 변경 핸들러 사용
                  placeholder={`새 ${title}을(를) 입력하세요`}
                  // 에러 상태에 따라 is-invalid 클래스 추가
                  className={`fw-medium ${error ? 'is-invalid' : ''}`} 
                  disabled={saveLoading}
                />
                
                {/* 에러 메시지 표시 */}
                {error && (
                    <Form.Control.Feedback type="invalid" className="d-block small mt-1">
                        {error}
                    </Form.Control.Feedback>
                )}

                {/* 입력 도움말 텍스트 표시 (에러가 없을 때만) */}
                {inputHelperText && !error && (
                    <Form.Text className="text-muted small mt-1">
                        {inputHelperText}
                    </Form.Text>
                )}
              </div>
            ) : (
              // 보기 모드
              <div className="fw-medium">{initialValue}</div>
            )}
            
            <div className="d-flex gap-2">
              {isEditing ? (
                // 저장/취소 버튼
                <>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={handleSave}
                    // 저장 버튼 비활성화 조건에 에러 상태 추가
                    disabled={saveLoading || tempValue.trim() === initialValue || tempValue.trim() === "" || !!error}
                  >
                    {saveLoading ? <Spinner size="sm" animation="border" /> : "저장"}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={handleCancel}
                    disabled={saveLoading}
                  >
                    취소
                  </Button>
                </>
              ) : (
                // 변경 버튼
                <Button
                  variant="outline-dark"
                  size="sm"
                  onClick={() => setIsEditing(true)} // 편집 모드 시작
                  disabled={saveLoading}
                >
                  변경
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default EditableUserInfoCard;