import React, { useEffect, useState } from "react";
import { BsSearch, BsX } from "react-icons/bs";
import { Button, Row, Form, ListGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";

import httpClient from '../../api/httpClient';
import MessengerSidebar from "../../components/chat/MessengerSidebar";
import { PROFILE_DEFAULT } from "../../utils/chatImages";
import "../../styles/MessengerLayout.css";

const UserSearchContent = ({ embedded }) => {
  const navigate = useNavigate();

  const [searchPhoneNumber, setSearchPhoneNumber] = useState(''); // 검색어
  const [searchResults, setSearchResults] = useState(null); // 검색 결과

  const accessToken = useSelector((state) => state.auth.accessToken);
  const userId = accessToken ? Number(jwtDecode(accessToken).sub) : null;

  // 친구 추가 API 호출
  const AddFriend = async (chatUserId) => {
    try {
      const data = {
        userId: userId,
        friendId: chatUserId,
      };

      await httpClient.post(`/friends`, data);
      console.log("친구 추가 요청, friendId:", chatUserId);

      setSearchResults((prev) => ({
        ...prev,
        ifFriend: true,
      }));

    } catch (error) {
      console.error("친구 추가 오류:", error);
    }
  };

  // 검색창 초기화
  const ClearSearch = () => {
    setSearchPhoneNumber('');
  };

  // 사용자 검색 API 호출
  useEffect(() => {
    if (!searchPhoneNumber) return;

    (async () => {
      try {
        const response = await httpClient.get(`/chat/users/search/${searchPhoneNumber}`);
        console.log("검색 결과:", response.data);
        setSearchResults(response.data);

      } catch (error) {
        console.error("사용자 검색 오류:", error);
        setSearchResults(null);
      }
    })();

  }, [searchPhoneNumber]);

  return (
    <div className={`d-flex flex-column bg-white ${embedded ? "h-100" : "vh-100"}`}>
      {/* Header */}
      <div className="messenger-header w-100">
        <h2 className="messenger-title mb-0">친구 추가</h2>
        <Button variant="light" className="ms-auto" onClick={() => navigate("/friends")}> 
          <BsX size={24} />
        </Button>
      </div>

      {/* Search Bar */}
      <Row className="px-4 py-3 border-bottom m-0">
        <div className="position-relative">
          <BsSearch
            size={18}
            className="position-absolute"
            style={{ top: '50%', left: '25px', transform: 'translateY(-50%)', color: '#888' }}
          />

          <Form.Control
            type="text"
            placeholder="전화번호로 검색"
            value={searchPhoneNumber}
            onChange={(e) => setSearchPhoneNumber(e.target.value)}
            style={{ paddingLeft: '40px', paddingRight: '40px' }}
          />

          {searchPhoneNumber && (
            <Button
              variant="link"
              onClick={ClearSearch}
              className="position-absolute"
              style={{
                top: '50%',
                right: '10px',
                transform: 'translateY(-50%)',
                color: '#666',
              }}
            >
              <BsX size={20} />
            </Button>
          )}
        </div>
      </Row>

      {/* Search Results */}
      <div className="flex-grow-1 overflow-auto">
        {searchPhoneNumber.trim() === '' ? (
          <div className="d-flex flex-column justify-content-center align-items-center h-100 text-center text-muted">
            <BsSearch size={40} className="mb-3" />
            전화번호를 입력하여 사용자를 검색하세요
          </div>
        ) : searchResults === null ? (
          <div className="d-flex flex-column justify-content-center align-items-center h-100 text-center text-muted">
            검색 결과가 없습니다
          </div>
        ) : (
          searchResults && (
            <ListGroup variant="flush">
                <ListGroup.Item key={searchResults.userId} className="d-flex align-items-center py-3 border-bottom">
                  {/* 프로필 */}
                  <img
                    src={`https://shift-main-images.s3.ap-northeast-3.amazonaws.com/user_profile/${searchResults.userId}.png`}
                    onError={(e) => (e.currentTarget.src = PROFILE_DEFAULT)}
                    alt={`${searchResults.name} 프로필 사진`}
                    className="rounded-circle border border-2 border-dark flex-shrink-0"
                    style={{ width: "48px", height: "48px" }}
                  />

                  {/* 이름 */}
                  <div className="flex-grow-1 ms-3">
                    {searchResults.name}
                    {searchResults.ifFriend && (
                      <span className="text-muted ms-2">(친구)</span>
                    )}
                  </div>

                  {/* 추가 버튼 */}
                  {!searchResults.ifFriend && (
                    <Button
                      variant="outline-dark"
                      onClick={() => AddFriend(searchResults.userId)}
                    >
                      추가
                    </Button>
                  )}
                </ListGroup.Item>
            </ListGroup>
          )
        )}
      </div>
    </div>
  );
};

const UserSearch = (props) => {
  if (props.embedded) {
    return <UserSearchContent {...props} embedded />;
  }

  return (
    <div className="messenger-layout">
      <MessengerSidebar active="friends" />

      <div className="messenger-column list-column">
        <UserSearchContent {...props} embedded />
      </div>

      <div className="messenger-column detail-column">
        <div className="messenger-placeholder">
          채팅방을 선택하면 대화가 이곳에 표시됩니다.
        </div>
      </div>
    </div>
  );
};

export default UserSearch;
