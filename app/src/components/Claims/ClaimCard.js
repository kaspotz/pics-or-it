import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { ToastContainer, toast } from 'react-toastify';

function ClaimCard({
  bountyId,
  claim,
  getTokenUri,
  isOwner,
  acceptClaim,
  bountyDetails,
}) {
  const { name, issuer, tokenId, description } = claim;
  const [isLoading, setIsLoading] = useState(true);
  const [imageSrc, setImageSrc] = useState('');

  const isClaimAccepted =
    Number(bountyDetails.claimId) === claim.id &&
    bountyDetails.claimer !== '0x0000000000000000000000000000000000000000';

  useEffect(() => {
    const fetchTokenUri = async () => {
      setIsLoading(true);
      try {
        const uri = await getTokenUri(tokenId);
        const response = await fetch(uri);
        const data = await response.json();
        const image = data.image;
        setImageSrc(image);
      } catch (error) {
        console.error('Error fetching token URI:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenUri();
  }, [getTokenUri, tokenId]);

  const handleAcceptClaim = async () => {
    try {
      await acceptClaim(bountyId, claim.id);
      toast.success('Claim accepted!');
    } catch (error) {
      toast.error('Error accepting claim');
    }
  };

  const truncatedName =
    name.length > 30
      ? `${name.substr(0, 20)}...${name.substr(name.length - 10, name.length)}`
      : name;

  const truncatedDescription =
    description.length > 100
      ? `${description.substr(0, 80)}...${description.substr(
          description.length - 20,
          description.length
        )}`
      : description;

  return (
    <div className={`claim-card ${isClaimAccepted ? 'accepted-claim' : ''}`}>
      <ToastContainer />
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="claim-card-image">
            <img src={imageSrc} alt={name} className="claim-image" />
          </div>
          <div className="claim-card-info">
            <div className="claim-card-title-wrap">
              <div className="claim-card-title">{truncatedName}</div>
              {isOwner ? (
                <button
                  className="claim-card-button"
                  onClick={handleAcceptClaim}
                >
                  {isClaimAccepted ? 'accepted' : 'accept'}
                </button>
              ) : (
                isClaimAccepted && (
                  <button className="claim-card-button" disabled>
                    accepted
                  </button>
                )
              )}
            </div>
            <details className="claim-card-issuer">
              <summary className="summary">issuer</summary>
              <div className="summary-body">{issuer}</div>
            </details>
            <details className="claim-card-details">
              <summary className="summary">description</summary>
              <div className="summary-body">{truncatedDescription}</div>
            </details>
          </div>
        </>
      )}
    </div>
  );
}

ClaimCard.propTypes = {
  claim: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    issuer: PropTypes.string.isRequired,
    tokenId: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired,
  }).isRequired,
  getTokenUri: PropTypes.func.isRequired,
  isOwner: PropTypes.bool.isRequired,
  acceptClaim: PropTypes.func.isRequired,
  bountyId: PropTypes.string.isRequired,
  bountyDetails: PropTypes.object.isRequired,
};

export default ClaimCard;
