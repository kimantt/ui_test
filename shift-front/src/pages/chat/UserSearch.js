import React, { useEffect, useState } from 'react';
import { BsSearch, BsX } from 'react-icons/bs';
import { Button, Container, Row, Col, Form, ListGroup } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";

import httpClient from '../../api/httpClient';

const UserSearch = () => {
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
    <Container
      fluid
      className="d-flex flex-column"
      style={{
        height: '100vh',
        maxWidth: '480px',
        borderLeft: '1px solid #ddd',
        borderRight: '1px solid #ddd',
        backgroundColor: '#fff',
      }}
    >
      {/* Header */}
      <Row className="p-4 border-bottom">
        <Col className="d-flex justify-content-between align-items-center">
          <h2 className="fw-bold m-0">친구 추가</h2>
          <Button variant="light" onClick={() => navigate("/friends")}>
            <BsX size={24} />
          </Button>
        </Col>
      </Row>

      {/* Search Bar */}
      <Row className="px-4 py-3 border-bottom">
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

                  <div
                    className="d-flex justify-content-center align-items-center"
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      border: '2px solid black',
                    }}
                  >
                    <strong>{searchResults.name[0]}</strong>
                  </div>

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
    </Container>
  );
};

export default UserSearch;
