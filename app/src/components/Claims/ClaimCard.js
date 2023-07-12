import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

function ClaimCard({ claim, getTokenUri }) {
  const { name, issuer, tokenId } = claim;
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
          <img src={imageSrc} alt={name} className="claim-image" />
          <div className="claim-info">
            <h3>{name}</h3>
            <p>Issuer: {issuer}</p>
            <details>
              <summary>Token ID: {tokenId}</summary>
              <p>{tokenId}</p>
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
  }).isRequired,
  getTokenUri: PropTypes.func.isRequired,
};

export default ClaimCard;
