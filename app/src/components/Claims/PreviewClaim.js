import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import CropZone from '../CropZone';
import { ethers } from 'ethers';

function PreviewClaim({ file, name, description, showSubmit, handleSubmit, wallet }) {
  // eslint-disable-next-line no-unused-vars
  const [submitOrCrop, setSubmitOrCrop] = useState(showSubmit);
  const [showCrop, setShowCrop] = useState(false);
  const [croppedImage, setCroppedImage] = useState(URL.createObjectURL(file));
  const [issuer, setIssuer] = useState()

  const truncatedName =
    name.length > 30
      ? `${name.substr(0, 10)}...${name.substr(name.length - 10, name.length)}`
      : name;

  const handleOnImageCropped = croppedImage => {
    setCroppedImage(croppedImage);
    setSubmitOrCrop(true);
    setShowCrop(false);
  };

  useEffect(() => {

    if (wallet?.provider) {

      const claimerAddress = ethers.getAddress(wallet.accounts[0].address);
      if (
        claimerAddress.length > 0
      ) {
        setIssuer(claimerAddress);
      }
    }
  }, [wallet]);

  return (
    <div>
      <div className="claim-card">
        <div className="claim-card-image">
          <img src={croppedImage} alt={name} className="claim-image" />
        </div>
        <div className="claim-card-info">
          <div className="claim-card-title-wrap">
            <div className="claim-card-title">{truncatedName}</div>
          </div>
          <details className="claim-card-issuer">
            <summary className="summary">issuer</summary>
            <div className="summary-body summary-issuer">
              {issuer}
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
            <button
              onClick={async () => await handleSubmit(croppedImage)}
              type="submit"
            >
              submit
            </button>
          </div>
        ) : (
          <div className="claim-popup-buttons">
            <button onClick={setShowCrop}>
              image must be square click to crop
            </button>
          </div>
        )}
      </div>
      {showCrop && (
        <CropZone image={file} onImageCropped={handleOnImageCropped} />
      )}
    </div>
  );
}

PreviewClaim.propTypes = {
  file: PropTypes.instanceOf(File).isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  showSubmit: PropTypes.bool.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  wallet: PropTypes.object,
};

export default PreviewClaim;