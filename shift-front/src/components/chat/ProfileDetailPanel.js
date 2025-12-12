import React from "react";
import { ListGroup } from "react-bootstrap";

const ProfileDetailPanel = ({
  title,
  imageSrc,
  onImageError,
  onImageClick,
  overlayText,
  fields,
}) => {
  return (
    <div className="profile-detail-shell">
      <div className="profile-detail-card">
        <div className="d-flex justify-content-between align-items-center mb-4 profile-detail-header">
          <h2 className="fw-bold m-0">{title}</h2>
        </div>

        <div className="d-flex flex-column align-items-center gap-4">
          <div
            className={`profile-image-wrapper ${onImageClick ? "clickable" : ""}`}
            onClick={onImageClick}
            style={{ position: "relative" }}
          >
            <img
              src={imageSrc}
              onError={onImageError}
              width="300"
              height="300"
              className="profile-avatar-lg"
              alt={`${title} 이미지`}
            />

            {overlayText && <div className="overlay-hover">{overlayText}</div>}
          </div>

          <ListGroup
            className="w-100 profile-field-list"
          >
            {fields.map(({ label, value }) => (
              <ListGroup.Item
                key={label}
                className="d-flex justify-content-between align-items-center px-4 py-3"
              >
                <span className="fw-bold text-muted">{label}</span>
                <span className="text-dark">{value ?? "-"}</span>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetailPanel;
