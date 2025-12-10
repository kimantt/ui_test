import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Spinner,
  Pagination,
  Form,
} from "react-bootstrap";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import ProductCard from "../../components/product/ProductCard";
import MainLayout from "../../components/common/MainLayout";
import "../../styles/productlist.css";  // ⭐ 스타일 외부 관리

// ⭐ 카테고리 ID → 카테고리명 매핑
const getCategoryName = (id) => {
  const map = {
    1: "디퓨저/캔들",
    2: "화병/트레이",
    3: "금액권",
  };
  return map[id] || "카테고리";
};

const ProductList = () => {
  const { categoryId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sortType, setSortType] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 20;

  useEffect(() => {
    loadData();
  }, [categoryId, location.pathname, sortType]);

  const loadData = async () => {
    setLoading(true);

    try {
      let res;

      if (location.pathname.includes("/shop/products")) {
        res = await axios.get("http://localhost:8080/products/sort", {
          params: { sortType },
        });
      } else if (categoryId) {
        res = await axios.get(
          `http://localhost:8080/products/categories/${categoryId}/products/sort`,
          { params: { sortType } }
        );
      }

      setProducts(res?.data || []);
    } catch (err) {
      console.error("상품 조회 실패:", err);
    }

    setLoading(false);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  return (
    <MainLayout maxWidth="1000px">
      <Container className="py-4">

        {/* 제목 + 정렬 */}
        <div className="productlist-header">
          <h4 className="fw-bold">
            {location.pathname.includes("/shop/products")
              ? "전체 상품"
              : getCategoryName(Number(categoryId))}
          </h4>

          <Form.Select
            className="productlist-sort"
            value={sortType}
            onChange={(e) => {
              setSortType(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="latest">최신순</option>
            <option value="priceAsc">가격 낮은순</option>
            <option value="priceDesc">가격 높은순</option>
          </Form.Select>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        ) : currentItems.length === 0 ? (
          <div className="text-center text-muted py-5">
            표시할 상품이 없습니다.
          </div>
        ) : (
          <>
            <Row xs={2} md={3} lg={4} className="g-4">
              {currentItems.map((p) => (
                <Col key={p.productId}>
                  <ProductCard
                    product={{
                      image: p.imageUrls && p.imageUrls.length > 0
                        ? p.imageUrls[0]
                        : null,
                      name: p.productName,
                      price: p.price,
                    }}
                    onClick={() => navigate(`/product/${p.productId}`)}
                  />
                </Col>
              ))}
            </Row>

            <div className="d-flex justify-content-center mt-4">
              <Pagination className="productlist-pagination">
                {[...Array(totalPages)].map((_, idx) => (
                  <Pagination.Item
                    key={idx + 1}
                    active={idx + 1 === currentPage}
                    onClick={() => setCurrentPage(idx + 1)}
                  >
                    {idx + 1}
                  </Pagination.Item>
                ))}
              </Pagination>
            </div>
          </>
        )}
      </Container>
    </MainLayout>
  );
};

export default ProductList;