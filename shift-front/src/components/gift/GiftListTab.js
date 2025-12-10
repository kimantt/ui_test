import React, { useState, useEffect } from 'react';
import { Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getReceivedGifts } from '../../api/giftApi';

const GiftListTab = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all'); // 'all' | 'PRODUCT' | 'POINT'
  const [giftItems, setGiftItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const formatNumber = (n) =>
    n == null ? "-" : Number(n).toLocaleString();


  // API에서 받은 선물 목록 가져오기
  useEffect(() => {
    const fetchGifts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getReceivedGifts();
        setGiftItems(data);
      } catch (err) {
        setError('선물 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchGifts();
  }, []);

  // 필터링 로직 (카테고리)
  const filteredGifts = giftItems.filter(item => {
    if (filter !== 'all' && item.giftType !== filter) return false;
    return true;
  });

  // 상세 페이지로 이동 (giftType 함께 전달)
  const handleViewDetail = (orderId, itemGiftType) => {
    navigate(`/gifts/${orderId}`, { 
      state: { giftType: itemGiftType }
    });
  };

  // 날짜 포맷
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}.${m}.${day}`;
  };
  
  // giftType 라벨
  const getGiftTypeLabel = (giftType) => {
    switch (giftType) {
      case "POINT":
        return "금액권";
      case "PRODUCT":
      default:
        return "상품";
    }
  };
  

  return (
    <div className="pt-3">
      {/* 카테고리 필터 버튼 */}
      <div className="mb-4 d-flex gap-2">
        {[
          { key: 'all', label: '전체' },
          { key: 'PRODUCT', label: '상품' },
          { key: 'POINT', label: '금액권' }
        ].map(opt => (
          <Button
            key={opt.key}
            variant={filter === opt.key ? 'dark' : 'outline-secondary'}
            size="sm"
            className="rounded-pill px-3"
            onClick={() => setFilter(opt.key)}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {/* 로딩 상태 */}
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="dark" />
          <div className="mt-2 text-muted">불러오는 중...</div>
        </div>
      )}

      {/* 에러 상태 */}
      {error && (
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      )}

      {/* 선물 리스트 (주문목록과 유사한 카드 UI) */}
      {!loading && !error && (
        <div className="d-flex flex-column gap-3">
          {filteredGifts.length > 0 ? (
            filteredGifts.map((item) => {
              const giftTypeLabel = getGiftTypeLabel(item.giftType);

              return (
                <Card
                  key={item.orderId}
                  className="border shadow-sm"
                  role="button"
                  onClick={() =>
                    handleViewDetail(item.orderId, item.giftType)
                  }
                >
                  <Card.Body className="p-4">
                    {/* 상단: 날짜 + 타입 뱃지 (주문목록의 상태 뱃지와 유사한 위치) */}
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted small">
                        {formatDate(item.orderDate)}
                      </span>
                      <Badge
                        bg="light"
                        text="dark"
                        className="border fw-normal"
                      >
                        {giftTypeLabel}
                      </Badge>
                    </div>

                    {/* 중단: 보낸 사람 / 선물번호 */}
                    <div className="d-flex justify-content-between mb-2">
                      <div>
                        <div className="text-muted small mb-1">
                          보낸 사람
                        </div>
                        <div className="fw-bold">
                          {item.senderName ?? "-"}
                        </div>
                      </div>

                      <div className="text-end">
                        <div className="text-muted small mb-1">
                          선물 번호
                        </div>
                        <div className="fw-bold">#{item.orderId}</div>
                      </div>
                    </div>

                    {/* 하단: 선물 내용 및 상품명 요약 */}
                    <div className="d-flex justify-content-between mt-3">
                      <div>
                        <div className="text-muted small mb-1">
                          선물 내용
                        </div>
                        <div className="fw-medium">
                          {item.productName ?? "선물 상세 정보"}
                        </div>
                      </div>

                      {/* 이미지는 목록에서 크게 사용하지 않고, 상세에서 확인 */}
                    </div>

                    {/* 하단 오른쪽: 상세보기 텍스트 (주문목록과 동일 패턴) */}
                    <div className="text-end mt-3 small text-secondary">
                      상세보기 &gt;
                    </div>
                  </Card.Body>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-5 text-muted bg-light rounded">
              표시할 선물이 없습니다.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GiftListTab;