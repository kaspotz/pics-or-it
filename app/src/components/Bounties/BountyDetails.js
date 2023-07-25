import React, { useEffect, useState } from 'react';
import ClaimCard from '../Claims/ClaimCard';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { ethers } from 'ethers';
import CreateClaim from '../Claims/CreateClaim';
import { ToastContainer, toast } from 'react-toastify';

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
    if (
      ethers.getAddress(bountyDetails.claimer) !==
      ethers.getAddress('0x0000000000000000000000000000000000000000')
    ) {
      toast.info('This bounty has already been claimed.');
      return;
    }
    setShowCreateClaim(true);
  };

  const handleCloseCreateClaim = () => {
    setShowCreateClaim(false);
  };

  useEffect(() => {
    // Declare an async function
    const fetchClaimsAndDetails = async () => {
      const claims = await getClaimsByBountyId(id);
      const bountyDetails = await fetchBountyDetails(id);

      // sort claims by priority and created time
      claims.sort((a, b) => {
        console.log(a, b, bountyDetails.claimId);
        // if a's id is the same as the bounty's claim id, a gets priority
        if (a.id === Number(bountyDetails.claimId)) return -1;
        // if b's id is the same as the bounty's claim id, b gets priority
        if (b.id === Number(bountyDetails.claimId)) return 1;
        // if neither are the bounty's claim id, sort by created time
        return b.createdAt - a.createdAt;
      });

      setUserClaims(claims);
      setBountyDetails(bountyDetails);
      setLoading(false);
    };

    // Call it right away
    fetchClaimsAndDetails();

    // And every 2 seconds
    const intervalId = setInterval(fetchClaimsAndDetails, 2000);

    // Clean up after ourselves by clearing the interval when the component unmounts
    return () => clearInterval(intervalId);
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
      <ToastContainer />
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
          <button onClick={handleClaimClick}>claim</button>
        </div>
      )}
      <div className="bounties-grid bounty-details-right">
        {loading ? (
          <div>loading...</div>
        ) : (
          userClaims.map(claim => (
            <ClaimCard
              key={claim.id}
              bountyId={id}
              bountyDetails={bountyDetails}
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
