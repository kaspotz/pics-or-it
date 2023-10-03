import React from 'react';
import PropTypes from 'prop-types';

function PreviewClaim({ file, name, description }) {
  const truncatedName =
    name.length > 30
      ? `${name.substr(0, 10)}...${name.substr(name.length - 10, name.length)}`
      : name;

  return (
    <div>
      <div className="claim-card">
        <div className="claim-card-image">
          <img
            src={URL.createObjectURL(file)}
            alt={name}
            className="claim-image"
          />
        </div>
        <div className="claim-card-info">
          <div className="claim-card-title-wrap">
            <div className="claim-card-title">{truncatedName}</div>
          </div>
          <details className="claim-card-issuer">
            <summary className="summary">issuer</summary>
            <div className="summary-body summary-issuer">
              0x000000000000000000000000000000000000dead
            </div>
          </details>
          <details className="claim-card-details">
            <summary className="summary">description</summary>
            <div className="summary-body">{description}</div>
          </details>
        </div>
      </div>
      <div className="preview-actions-wrap">
        <div className="claim-popup-buttons">
          <button type="submit">crop</button>
        </div>
        <div className="claim-popup-buttons">
          <button type="submit">submit</button>
        </div>
      </div>
    </div>
  );
}

PreviewClaim.propTypes = {
  file: PropTypes.instanceOf(File).isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

export default PreviewClaim;
