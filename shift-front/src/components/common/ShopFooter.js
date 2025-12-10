import React from "react";
import { Container } from "react-bootstrap";
import "../../styles/footer.css";

const ShopFooter = () => {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="shop-footer">
      <Container className="footer-container">

        {/* TOP 버튼 — 푸터 내부와 결합된 스타일 */}
        <div className="footer-top-btn" onClick={scrollTop}>
          ▲ TOP
        </div>

        {/* 팀 정보 */}
        <div className="footer-info">

          <div><strong>Team :</strong> Shift 1조</div>

          <div>
            <strong>GitHub :</strong>{" "}
            <a
              href="https://github.com/Shift-hyundaiezwel-6th-team-pj"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub.com/Shift
            </a>
          </div>

          <div>
            <strong>Google :</strong>{" "}
            <span>ShiftTeamOfficial@gmail.com</span>
          </div>

          <div><strong>Team Motto :</strong> Shift your moments, make gifting easier.</div>
        </div>

        {/* 저작권 */}
        <div className="footer-copy">
          © 2025 SHIFT. Portfolio Project.<br />
          All rights reserved.
        </div>
      </Container>
    </footer>
  );
};

export default ShopFooter;
