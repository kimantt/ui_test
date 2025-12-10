import { Modal, Button } from "react-bootstrap";
import { BsExclamationCircle } from "react-icons/bs";

const DeleteConfirmModal = ({ show, onConfirm, onCancel, message }) => {
  return (
    <Modal
      show={show}
      onHide={onCancel}
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Body className="text-center py-4">

        <BsExclamationCircle size={48} className="text-danger mb-3" />

        <h5 className="fw-bold mb-3">정말 삭제하시겠습니까?</h5>

        <p className="text-muted" style={{ fontSize: "14px" }}>
          {message || "삭제 시 복구가 불가능합니다."}
        </p>

        <div className="d-flex justify-content-center gap-3 mt-4 px-3">
        <Button variant="danger" onClick={onConfirm} className="px-4">
            삭제하기
        </Button>
        <Button variant="secondary" onClick={onCancel} className="px-4">
            취소
        </Button>
        </div>

      </Modal.Body>
    </Modal>
  );
};

export default DeleteConfirmModal;