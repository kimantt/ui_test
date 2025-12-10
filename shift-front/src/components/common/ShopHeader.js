import React, { useState, useEffect } from "react";
import {
  Container,
  Navbar,
  Nav,
  Form,
  InputGroup,
  Button,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { BsSearch, BsCart, BsChatSquareDots } from "react-icons/bs"; // 메신저 아이콘 추가
import "../../styles/header.css";

import { setCurrentRoomId } from "../../store/chatSlice";
import { resolveProductImage } from "../../utils/productImages";


const ShopHeader = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [keyword, setKeyword] = useState("");

  // 검색 기능
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    navigate(`/shop/search?keyword=${keyword}`);
  };

  return (
    <>
      {/* 상단 로고 + 검색 + 아이콘 */}
      <Navbar bg="white" className="header-top border-bottom py-3">
        <Container className="header-container">
          {/* 로고 클릭 → 쇼핑몰 홈 */}
          <Navbar.Brand
            role="button"
            className="d-flex align-items-center"
            onClick={() => navigate("/shop")}
          >
            <img
              src={resolveProductImage("shiftlogo.png")}
              alt="Shift Logo"
              style={{
                height: "40px",
                objectFit: "contain",
                cursor: "pointer",
              }}
            />
          </Navbar.Brand>

          {/* 검색바 */}
          <Form
            className="header-search d-none d-md-flex flex-grow-1 mx-4"
            onSubmit={handleSearchSubmit}
          >
            <InputGroup>
              <Form.Control
                placeholder="검색"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="search-input shadow-none"
              />
              <Button
                variant="light"
                className="search-btn px-3"
                type="submit"
              >
                <BsSearch />
              </Button>
            </InputGroup>
          </Form>

          <Nav className="header-icons d-flex flex-row gap-3 align-items-center">
            {/* 장바구니 이동 */}
            <Button
              variant="link"
              className="text-dark p-0"
              onClick={() => navigate("/cart")}
            >
              <BsCart size={24} />
            </Button>

            {/* 메신저 아이콘 클릭 시 메신저 페이지로 이동 */}
            <Button
              variant="link"
              className="text-dark p-0"
              onClick={() => {
                window.SHIFT_RECEIVER_ID = "";
                window.SHIFT_RECEIVER_NAME = "";
                window.SHIFT_GIFT_FROM_CHAT = false;
                window.SHIFT_GIFT_FROM_FRIEND = false;
                dispatch(setCurrentRoomId(null));
                navigate("/chatroom/list");
              }}  // 메신저 페이지로 이동
            >
              <BsChatSquareDots size={24} /> {/* 메신저 아이콘 */}
            </Button>
          </Nav>
        </Container>
      </Navbar>

      {/* 카테고리 바 (고정 표기) */}
      <div className="category-bar border-bottom">
        <Container className="header-container">
          <Nav className="gap-4 overflow-auto flex-nowrap category-nav">
            <Nav.Link
              className="category-item text-nowrap"
              onClick={() => navigate("/shop/products")}
            >
              전체상품
            </Nav.Link>

            <Nav.Link
              className="category-item text-nowrap"
              onClick={() => navigate("/category/1")}
            >
              디퓨저/캔들
            </Nav.Link>

            <Nav.Link
              className="category-item text-nowrap"
              onClick={() => navigate("/category/2")}
            >
              화병/트레이
            </Nav.Link>

            <Nav.Link
              className="category-item text-nowrap"
              onClick={() => navigate("/gift-card")}
            >
              금액권
            </Nav.Link>

            {/* 금액권 오른쪽에 마이페이지 배치 */}
            <Nav.Link
              className="category-item text-nowrap"
              onClick={() => navigate("/mypage")}  // 쇼핑몰 마이페이지로 이동
            >
              마이페이지
            </Nav.Link>
          </Nav>
        </Container>
      </div>
    </>
  );
};

export default ShopHeader;