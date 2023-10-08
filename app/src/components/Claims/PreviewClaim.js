import React, { useState } from 'react';
import PropTypes from 'prop-types';
import CropZone from '../CropZone';

function PreviewClaim({ file, name, description, showSubmit }) {
  // eslint-disable-next-line no-unused-vars
  const [submitOrCrop, setSubmitOrCrop] = useState(showSubmit);
  const [showCrop, setShowCrop] = useState(false);

  const truncatedName =
    name.length > 30
      ? `${name.substr(0, 10)}...${name.substr(name.length - 10, name.length)}`
      : name;

  const handleOnImageCropped = (croppedImage) => {
    console.log(croppedImage);
  }

  // console.log('lolololol', URL.createObjectURL(file))


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
        {submitOrCrop ? (
          <div className="claim-popup-buttons">
            <button type="submit">submit</button>
          </div>
        ) : (
          <div className="claim-popup-buttons">
            <button onClick={setShowCrop}>crop</button>
          </div>
        )}
      </div>
      {showCrop && <CropZone image={file} onImageCropped={handleOnImageCropped} />}
    </div>
  );
}

PreviewClaim.propTypes = {
  file: PropTypes.instanceOf(File).isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  showSubmit: PropTypes.bool.isRequired,
};

export default PreviewClaim;
