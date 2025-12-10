import "../../styles/ChatRoom.css";
import MessengerBottomNav from "../../components/chat/MessengerBottomNav";
import MessengerSidebar from "../../components/chat/MessengerSidebar";
import { ListGroup } from "react-bootstrap";
import { PROFILE_DEFAULT } from "../../utils/chatImages";
import { useEffect, useState } from "react";
import { getMyInfo } from "../../api/userApi";

const ChatMyPageContent = ({ embedded }) => {
  const profile_default = PROFILE_DEFAULT;
  const [user, setUser] = useState({
      id: "",
      name: "",
      phone: "",
    });
  const [userLoading, setUserLoading] = useState(false);
  useEffect(() => {
    const loadPageData = async () => {
      setUserLoading(true);
  
      try {
        // 1) 사용자 정보 먼저
        const userData = await getMyInfo();
        setUser(userData);
        const userId = userData?.userId;
  
      } catch (e) {
        console.error("채팅 마이페이지 로드 실패", e);
      } finally {
        setUserLoading(false);
      }
    };
  
    loadPageData();
  }, []);
  return (
    <div
      className={`bg-white d-flex flex-column justify-content-center ${
        embedded ? "h-100 w-100" : "vh-100 mx-auto border-start border-end"
      }`}
      style={
        embedded
          ? { maxWidth: "720px", margin: "0 auto", padding: "32px 0" }
          : { maxWidth: "480px" }
      }
    >
      <div className="px-4 py-4 align-items-center ">
        <div className="d-flex align-items-center justify-content-between mb-5">
          <h2 className="fw-bold m-0">마이페이지</h2>
        </div>
        <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center px-4 py-4">
          <img src={profile_default} width="100" height="100" style={{borderRadius:"50%"}}></img>
        </div>
        <ListGroup variant="flush" className="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
          <ListGroup.Item
            className="d-flex justify-content-between align-items-center border rounded-3 px-4 py-3 mb-3 w-75 shadow-sm"
          >
            <span className="fw-bold text-muted">이름</span>
            <span>{user.name}</span>
          </ListGroup.Item>

          <ListGroup.Item
            className="d-flex justify-content-between align-items-center border rounded-3 px-4 py-3 mb-3 w-75 shadow-sm"
          >
            <span className="fw-bold text-muted">ID</span>
            <span>{user.loginId}</span>
          </ListGroup.Item>

          <ListGroup.Item
            className="d-flex justify-content-between align-items-center border rounded-3 px-4 py-3 mb-3 w-75 shadow-sm"
          >
            <span className="fw-bold text-muted">전화번호</span>
            <span>{user.phone}</span>
          </ListGroup.Item>
        </ListGroup>
      </div>
      {/* Bottom Navigation*/}
      {!embedded && (
        <div className="mt-auto">
          <MessengerBottomNav active="chatroom/mypage" />
        </div>
      )}
    </div>
  );
};

const ChatMyPage = (props) => {
  if (props.embedded) {
    return <ChatMyPageContent {...props} embedded />;
  }

  return (
    <div className="messenger-layout">
      <MessengerSidebar active="chatroom/mypage" />

      <div className="messenger-column merged-column">
        <ChatMyPageContent embedded />
      </div>
    </div>
  );
};

export default ChatMyPage;
