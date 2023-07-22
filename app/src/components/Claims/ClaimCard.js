import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

function ClaimCard({ claim, getTokenUri }) {
  console.log(claim);
  const { name, issuer, tokenId, description } = claim;
  const [isLoading, setIsLoading] = useState(true);
  const [imageSrc, setImageSrc] = useState('');

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

  return (
    <div className="claim-card">
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="claim-card-image">
            <img src={imageSrc} alt={name} className="claim-image" />
          </div>
          <div className="claim-card-info">
            <h3 className="claim-card-title">{name}</h3>
            <p className="claim-card-issuer">Issuer: {issuer}</p>
            <details className="claim-card-details">
              <summary>description</summary>
              <p>{description}</p>
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
};

export default ClaimCard;
