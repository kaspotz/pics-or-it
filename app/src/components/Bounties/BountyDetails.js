import React, { useEffect, useState } from 'react';
import ClaimCard from '../Claims/ClaimCard';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { ethers } from 'ethers';
import CreateClaim from '../Claims/CreateClaim';
import { ToastContainer, toast } from 'react-toastify';
import { BsArrowRightCircle } from 'react-icons/bs';
import { blacklist } from '../../blacklist';

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
  const [isClaimed, setIsClaimed] = useState(false);

  useEffect(() => {
    if (bountyDetails.claimer) {
      if (
        ethers.getAddress(bountyDetails.claimer) !==
        ethers.getAddress('0x0000000000000000000000000000000000000000')
      ) {
        setIsClaimed(true);
      }
    }
  }, [bountyDetails]);

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

  const copyToClipboard = () => {
    if (!navigator.clipboard) {
      // Clipboard API not supported
      return;
    }
    navigator.clipboard.writeText(`https://poidh.xyz/bounties/${id}`).then(
      () => {
        toast.success('Bounty link copied to clipboard!');
      },
      err => {
        console.error('Failed to copy text: ', err);
        toast.error(
          `Failed to copy bounty link to clipboard. Link: poidh.xyz/bounties/${id}`,
          { autoClose: false }
        );
      }
    );
  };

  useEffect(() => {
    const fetchClaimsAndDetails = async () => {
      let claims = await getClaimsByBountyId(id);
      const bountyDetails = await fetchBountyDetails(id);

      claims.sort((a, b) => {
        if (a.id === Number(bountyDetails.claimId)) return -1;
        if (b.id === Number(bountyDetails.claimId)) return 1;
        return b.createdAt - a.createdAt;
      });

      blacklist.forEach(bounty => {
        if (bounty.bountyId === Number(id)) {
          claims = claims.filter(claim => !bounty.claims.includes(claim.id));
        }
      });

      setUserClaims(claims);
      setBountyDetails(bountyDetails);
      setLoading(false);
    };

    fetchClaimsAndDetails();

    //const intervalId = setInterval(fetchClaimsAndDetails, 3000);
    //return () => clearInterval(intervalId);

  }, [id]);

  useEffect(() => {
    if (wallet && bountyDetails.name) {
      if (
        ethers.getAddress(wallet.accounts[0].address) ===
        ethers.getAddress(bountyDetails.issuer)
      ) {
        setIsOwner(true);
      }
    }
  }, [wallet, bountyDetails]);

  return (
    <div className="bounty-details-wrap">
      <div className="bounty-details-left">
        <h1 data-aos="fade-in">pics or it didn&#39;t happen</h1>
        <h1>bounty details</h1>
        <div className="bounty-details">
          <h2 className="bounty-details-title">{bountyDetails.name}</h2>
          <p className="summary-body">{bountyDetails.description}</p>
          <h3>{bountyDetails.amount} eth</h3>
          <div className="share-bounty-wrap" onClick={copyToClipboard}>
            <p>share bounty</p>
            <BsArrowRightCircle size={20} color="#F4595B" />
          </div>
        </div>
      </div>
      {!isClaimed &&
        (!wallet ? (
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
        ))}
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
              isClaimed={isClaimed}
            />
          ))
        )}
      </div>
      {showCreateClaim && (
        <CreateClaim bountyId={id} onClose={handleCloseCreateClaim} />
      )}
      <ToastContainer />
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
