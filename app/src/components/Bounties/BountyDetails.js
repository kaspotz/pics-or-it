import React, { useEffect, useState } from 'react';
import ClaimCard from '../Claims/ClaimCard';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { ethers } from 'ethers';
import CreateClaim from '../Claims/CreateClaim';

function BountyDetails({
  getTokenUri,
  getClaimsByBountyId,
  fetchBountyDetails,
  wallet,
  connect,
  disconnect,
  connecting,
  acceptClaim,
}) {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [userClaims, setUserClaims] = useState([]);
  const [bountyDetails, setBountyDetails] = useState({});
  const [isOwner, setIsOwner] = useState(false);
  const [showCreateClaim, setShowCreateClaim] = useState(false);

  const handleClaimClick = () => {
    setShowCreateClaim(true);
  };

  const handleCloseCreateClaim = () => {
    setShowCreateClaim(false);
  };

  useEffect(() => {
    (async () => {
      const claims = await getClaimsByBountyId(id);
      const bountyDetails = await fetchBountyDetails(id);
      setUserClaims(claims);
      setBountyDetails(bountyDetails);
      setLoading(false);
    })();
  }, [id]);

  useEffect(() => {
    if (wallet && bountyDetails.name) {
      console.log(ethers.getAddress(wallet.accounts[0].address));
      console.log(ethers.getAddress(bountyDetails.issuer));
      if (
        ethers.getAddress(wallet.accounts[0].address) ===
        ethers.getAddress(bountyDetails.issuer)
      ) {
        console.log('here');
        setIsOwner(true);
      }
    }
  }, [wallet, bountyDetails]);

  return (
    <div className="bounty-details-wrap">
      <div className="bounty-details-left">
        <h1>bounty details</h1>
        <div className="bounty-details">
          <details className="bounty-card-details">
            <summary className="bounty-summary">name</summary>
            <div className="summary-body">{bountyDetails.name}</div>
          </details>
          <details className="bounty-card-details">
            <summary className="bounty-summary">description</summary>
            <div className="summary-body">{bountyDetails.description}</div>
          </details>
          <details className="bounty-card-details">
            <summary className="bounty-summary">reward</summary>
            <div className="summary-body">{bountyDetails.amount} eth</div>
          </details>
        </div>
      </div>
      {!wallet ? (
        <div className="bounty-details-connect-claim-button-wrap">
          <button
            disabled={connecting}
            onClick={() =>
              wallet ? disconnect({ label: wallet.label }) : connect()
            }
          >
            {connecting ? 'connecting' : wallet ? 'disconnect' : 'connect'}
          </button>
        </div>
      ) : (
        <div className="bounty-details-connect-claim-button-wrap">
          <button onClick={handleClaimClick}>Claim</button>
        </div>
      )}
      <div className="bounties-grid bounty-details-right">
        {loading ? (
          <div>Loading...</div>
        ) : (
          userClaims.map(claim => (
            <ClaimCard
              key={claim.id}
              bountyId={id}
              claim={claim}
              getTokenUri={getTokenUri}
              isOwner={isOwner}
              acceptClaim={acceptClaim}
            />
          ))
        )}
      </div>
      {showCreateClaim && (
        <CreateClaim bountyId={id} onClose={handleCloseCreateClaim} />
      )}
    </div>
  );
}

BountyDetails.propTypes = {
  getTokenUri: PropTypes.func.isRequired,
  getClaimsByBountyId: PropTypes.func.isRequired,
  fetchBountyDetails: PropTypes.func.isRequired,
  wallet: PropTypes.object,
  acceptClaim: PropTypes.func.isRequired,
  connect: PropTypes.func.isRequired,
  disconnect: PropTypes.func.isRequired,
  connecting: PropTypes.bool.isRequired,
};

export default BountyDetails;
