import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { searchProducts } from "../../api/productApi";
import ProductCard from "../../components/product/ProductCard";
import MainLayout from "../../components/common/MainLayout";

const ProductSearch = () => {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") || "";
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!keyword) return;
    loadSearch();
  }, [keyword]);

  const loadSearch = async () => {
    setLoading(true);
    try {
      const data = await searchProducts(keyword);
      console.log("검색 응답:", data);

      // ProductCard에서 바로 사용할 수 있도록 구조 통일
      const normalized = data.map((p) => ({
        ...p,
        name: p.name || p.productName,
        image: p.image || p.imageUrl || (p.imageUrls ? p.imageUrls[0] : null),
      }));

      setProducts(normalized || []);
    } catch (e) {
      console.error("검색 오류:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container py-4" style={{ minHeight: "70vh" }}>
        <h4 className="fw-bold mb-4">
  검색 결과: "<span className="search-highlight">{keyword}</span>"
        </h4>

        {loading && <p>로딩 중...</p>}

        {!loading && products.length === 0 && (
          <p className="text-muted">검색 결과가 없습니다.</p>
        )}

        <div className="row g-3">
          {products.map((p) => (
            <div key={p.productId} className="col-6 col-md-3">
              <ProductCard
                product={p}
                onClick={() => navigate(`/product/${p.productId}`)}
              />
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductSearch;