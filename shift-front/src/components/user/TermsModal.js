// src/pages/user/signUp/TermsModal.js

import React from 'react';

const termsContent = {
  terms: `제1조 (목적)\n본 약관은 Shift(이하 "회사")가 제공하는 소셜 기프팅 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.\n\n제2조 (용어의 정의)\n1. "서비스"란 회사가 제공하는 대화형 커머스 및 선물하기 서비스를 의미합니다.`,
  privacy: `개인정보 수집 및 이용 동의\n\n1. 수집하는 개인정보 항목\n회사는 회원가입, 상담, 서비스 신청 등을 위해 아래와 같은 개인정보를 수집하고 있습니다.\n- 필수항목: 아이디, 비밀번호, 이름, 전화번호, 주소`,
  marketing: `마케팅 정보 수신 동의\n\n회사는 이용자의 서비스 이용 편의를 위해 다음과 같은 마케팅 정보를 제공합니다.\n\n1. 수신 정보의 내용\n- 신규 서비스 안내\n- 이벤트 및 프로모션 정보`
};

const modalTitles = {
  terms: '서비스 이용약관',
  privacy: '개인정보 수집 및 이용 동의',
  marketing: '마케팅 정보 수신 동의'
};

export default function TermsModal({ isOpen, type, onClose, onAgree }) {
  if (!isOpen) return null;

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content border-0 shadow">
            <div className="modal-header">
              <h5 className="modal-title fw-bold">{modalTitles[type]}</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body" style={{ whiteSpace: 'pre-line', fontSize: '0.9rem' }}>
              {type ? termsContent[type] : ''}
            </div>
            <div className="modal-footer flex-nowrap">
              <button type="button" className="btn btn-outline-secondary w-50 py-2" onClick={onClose}>
                취소
              </button>
              <button type="button" className="btn btn-dark w-50 py-2" onClick={onAgree}>
                동의
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
}