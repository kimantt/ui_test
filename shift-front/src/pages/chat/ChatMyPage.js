import "../../styles/ChatRoom.css";
import "../../styles/ChatMyPage.css";
import MessengerBottomNav from "../../components/chat/MessengerBottomNav";
import MessengerSidebar from "../../components/chat/MessengerSidebar";
import { Modal, Button, Form, ListGroup } from "react-bootstrap";
import { PROFILE_DEFAULT } from "../../utils/chatImages";
import { useEffect, useState } from "react";
import { getMyInfo } from "../../api/userApi";
import { uploadProfileImage } from "../../api/userProfileImage";

const ChatMyPageContent = ({ embedded }) => {
  const profile_default = PROFILE_DEFAULT;

  const [user, setUser] = useState({
      id: "",
      name: "",
      phone: "",
    });
  const [imgSrc, setImgSrc] = useState();
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);       // 이미지 미리보기
  const [uploading, setUploading] = useState(false);        // 업로드 로딩

  useEffect(() => {
    const loadPageData = async () => {
      try {
        // 1) 사용자 정보 먼저
        const userData = await getMyInfo();
        setUser(userData);
        const userId = userData?.userId;
        setImgSrc(`https://shift-main-images.s3.ap-northeast-3.amazonaws.com/user_profile/${userId}.png?ts=${Date.now()}`);
  
      } catch (e) {
        console.error("채팅 마이페이지 로드 실패", e);
      }
    };
  
    loadPageData();
  }, []);

  // 파일 선택 시 미리보기
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  // 업로드 실행
  const handleUploadImage = async () => {
    if (!selectedFile) {
      alert("이미지를 선택해주세요.");
      return;
    }

    setUploading(true);

    try {
      const result = await uploadProfileImage(selectedFile);

      // 업로드 성공 -> 다시 사용자 정보 가져오기
      const userData = await getMyInfo();
      setUser(userData);

      // 이미지 갱신
      const userId = userData.userId;
      setImgSrc(
        `https://shift-main-images.s3.ap-northeast-3.amazonaws.com/user_profile/${userId}.png?ts=${Date.now()}`
      );

      alert("프로필 사진이 변경되었습니다!");
      setShowModal(false);
      setPreviewUrl(null);

    } catch (error) {
      console.error(error);
      alert("업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  };

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
      <Modal show={showModal} onHide={() => {
        setShowModal(false);
        setPreviewUrl(null);
      }} centered>
        <Modal.Header closeButton>
          <Modal.Title>프로필 사진 변경</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group>
            <Form.Label>새 이미지 선택</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
          </Form.Group>

          {previewUrl && (
            <div className="text-center mt-3">
              <img src={previewUrl} alt="preview" width="120" height="120" style={{ borderRadius: "50%" }} />
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowModal(false);
            setPreviewUrl(null);
          }}>
            취소
          </Button>
          <Button variant="primary" onClick={handleUploadImage} disabled={uploading}>
            {uploading ? "업로드 중..." : "확인"}
          </Button>
        </Modal.Footer>
      </Modal>

      <div className="px-4 py-4 align-items-center ">
        <div className="d-flex align-items-center justify-content-between mb-5">
          <h2 className="fw-bold m-0">마이페이지</h2>
        </div>
        <div
          className="profile-image-wrapper"
          onClick={() => setShowModal(true)}
          style={{ cursor: "pointer", position: "relative" }}
        >
          <img
            src={imgSrc}
            onError={() => setImgSrc(profile_default)}
            width="150"
            height="150"
            style={{ borderRadius: "50%" }}
          />

          <div className="overlay-hover">
            사진 변경
          </div>
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
