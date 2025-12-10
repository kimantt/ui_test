import React, { useEffect, useState } from "react";
import { Card, Spinner } from "react-bootstrap";
import { getUserPointHistory, getMyInfo } from "../../api/userApi";

const MyPointTab = () => {
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const formatDate = (str) => {
    const d = new Date(str);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
      d.getDate()
    ).padStart(2, "0")}`;
  };

  const formatNumber = (n) => (n == null ? "-" : Number(n).toLocaleString());

  useEffect(() => {
    loadPoints();
  }, []);

  const loadPoints = async () => {
    setLoading(true);
    try {
      const user = await getMyInfo();
      setPoints(user.points || 0);

      const historyRes = await getUserPointHistory(user.userId);
      setHistory(historyRes.history || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-3">

      <div className="bg-light rounded-3 border p-5 text-center mb-4">
        <div className="text-secondary small">보유 포인트</div>
        <h2 className="fw-bold">{formatNumber(points)}P</h2>
      </div>

      <h5 className="fw-bold mb-3">포인트 내역</h5>

      {loading && (
        <div className="d-flex justify-content-center py-4">
          <Spinner animation="border" />
        </div>
      )}

      {!loading &&
        history.map((item) => (
          <Card
            key={item.transactionId}
            className="border-0 border-bottom rounded-0 py-2"
          >
            <Card.Body className="px-0">

              <div className="text-muted small mb-1">
                {formatDate(item.createdAt)}
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <span
                  className={`fw-semibold ${
                    item.type === "U"
                      ? "text-danger"
                      : item.type === "A"
                      ? "text-primary"
                      : "text-success"
                  }`}
                >
                  {{
                    A: "적립",
                    U: "사용",
                    R: "복원",
                  }[item.type] || "기타"}
                </span>

                <span
                  className={`fw-bold ${
                    item.type === "U"
                      ? "text-danger"
                      : item.type === "A"
                      ? "text-primary"
                      : "text-success"
                  }`}
                >
                  {item.type === "U" ? "-" : "+"}
                  {formatNumber(item.amount)} P
                </span>
              </div>

            </Card.Body>
          </Card>
        ))}
    </div>
  );
};

export default MyPointTab;