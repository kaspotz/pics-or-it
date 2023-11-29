import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { ToastContainer } from 'react-toastify';

function ClaimCard({
    claim,
    getTokenUri,
}) {
    const { name, issuer, tokenId, description, id, issuerMyBountyUrl, openSeaUrl, bountyId } = claim;
    const [isLoading, setIsLoading] = useState(true);
    const [imageSrc, setImageSrc] = useState('');

    const isClaimAccepted = (id != null);

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

    const truncatedName = name
        ? name.length > 30
            ? `${name.substr(0, 10)}...${name.substr(name.length - 10, name.length)}`
            : name
        : null;

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
                        </div>
                        <details className="claim-card-issuer">
                            <summary className="summary">issuer</summary>
                            <a className="summary-body summary-issuer" href={`/my-bounties/${issuerMyBountyUrl}`} target="_blank" rel="noreferrer noopener">{issuer}</a>
                        </details>
                        <details className="claim-card-issuer">
                            <summary className="summary">description</summary>
                            <div className="summary-body summary-issuer">{description}</div>
                        </details>
                        <details className="claim-card-issuer">
                            <summary className="summary">source bounty</summary>
                            <a className="summary-body summary-issuer" href={`/bounties/${bountyId}`} target="_blank" rel="noreferrer noopener">{`Bounty id ${bountyId}`}</a>
                        </details>
                        <details className="claim-card-issuer">
                            <summary className="summary">opensea</summary>
                            <a className="summary-body summary-issuer" href={openSeaUrl} target="_blank" rel="noreferrer noopener">opensea link</a>
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
        issuerMyBountyUrl: PropTypes.string.isRequired,
        openSeaUrl: PropTypes.string.isRequired,
        bountyId: PropTypes.string.isRequired,
    }).isRequired,
    getTokenUri: PropTypes.func.isRequired,
    bountyId: PropTypes.string.isRequired,
};

export default ClaimCard;
