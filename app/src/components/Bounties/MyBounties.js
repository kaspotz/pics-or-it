import React, { useEffect, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import BountyCard from './BountyCard';
import { toast, ToastContainer } from 'react-toastify';
import NftCard from '../Claims/NftCard';
import { useParams } from 'react-router-dom';

function MyBounties({
  userBounties,
  fetchUserBounties,
  cancelBounty,
  wallet,
  connect,
  disconnect,
  connecting,
  userSummary,
  getTokenUri,
  acceptClaim,
  createNftCards,
  userNftCards,
}) {

  const [userAddress, setUserAddress] = useState();
  const { urlUserAddress } = useParams();

  console.log("og urlUserAddress", urlUserAddress);

  useEffect(() => {
    if (urlUserAddress && urlUserAddress.toLowerCase() !== "undefined" && urlUserAddress.length > 0) {
      console.log("urlUserAddress ", urlUserAddress);
      setUserAddress(urlUserAddress);
    } else if (wallet) {
      setUserAddress(wallet.accounts[0].address);
    }

  }, [urlUserAddress, wallet]);

  const refreshBounties = useCallback(
    toToast => {
      if (wallet) {
        fetchUserBounties(userAddress);
        if (toToast) {
          toast.success('Bounty cancelled successfully!');
        }
      }
    },
    [wallet, fetchUserBounties]
  );

  function acctFormatted() {
    if (userAddress && userAddress.length > 10) {
      return `${userAddress.substring(0, 6)}...${userAddress.substring(userAddress.length - 4)}`.toLowerCase();
    }
    return userAddress;
  }

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     refreshBounties(false);
  //   }, 3000);

  //   // cleanup function on component unmount
  //   return () => clearInterval(intervalId);
  // }, [refreshBounties]);

  useEffect(() => {
    const callCreateNftCards = async () => {
      await createNftCards(userAddress);
    }
    console.log("call nft card userAddress ", userAddress);
    if (userAddress && userAddress.length > 0) callCreateNftCards();

  }, [userBounties]);

  useEffect(() => {
    const callFetchUserBounties = async () => {
      await fetchUserBounties(userAddress);
    }
    if (userAddress && userAddress.length > 0) callFetchUserBounties();

  }, [userAddress]);

  return (
    <div className="my-bounties-wrap">
      {(!wallet && urlUserAddress.toLowerCase() == "undefined") ? (
        <div>
          <h2>connect your wallet to view your bounties</h2>
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
        <div>
          <div>
            <h1 className="my-profile-header">
              your profile
            </h1>
            <div className="formatted-account">
              {acctFormatted()}
            </div>
          </div>
          <div className="table-container">
            <table className="summary-table">
              <tr>
                <th className="summary-align-left">
                  completed bounties:
                </th>
                <th className="summary-align-right">
                  {userSummary.completedBounties}
                </th>
              </tr>
              <tr>
                <th className="summary-align-left">
                  total eth sent:
                </th>
                <th className="summary-align-right">
                  {userSummary.ethSpent?.toFixed(6)}
                </th>
              </tr>
            </table>
            <table className="summary-table">
              <tr>
                <th className="summary-align-left">
                  in progress bounties:
                </th>
                <th className="summary-align-right">
                  {userSummary.inProgressBounties}
                </th>
              </tr>
              <tr>
                <th className="summary-align-left">
                  total eth in contracts:
                </th>
                <th className="summary-align-right">
                  {userSummary.ethInOpenBounties?.toFixed(6)}
                </th>
              </tr>
            </table>
            <table className="summary-table">
              <tr>
                <th className="summary-align-left">
                  completed claims:
                </th>
                <th className="summary-align-right">
                  {userSummary.completedClaims}
                </th>
              </tr>
              <tr>
                <th className="summary-align-left">
                  eth made:
                </th>
                <th className="summary-align-right">
                  {userSummary.ethMade?.toFixed(6)}
                </th>
              </tr>
            </table>
          </div>
          <div>
            <h1>
              your nfts
            </h1>
          </div>
          <div className="bounties-grid bounty-details-right">
            {
              userNftCards
                .map(claim => (
                  <NftCard
                    key={claim.id}
                    bountyId={claim.id}
                    bountyDetails={claim}
                    claim={claim}
                    getTokenUri={getTokenUri}
                    isOwner={true}
                    acceptClaim={acceptClaim}
                    isClaimed={true}
                  />
                ))
            }
          </div>
          <div>
            <h1>
              your bounties
            </h1>
          </div>
          <div className="bounties-grid">
            {userBounties
              .filter(bounty => bounty.amount > 0)
              .sort((a, b) => b.createdAt - a.createdAt)
              .map(bounty => (
                <BountyCard
                  key={bounty.id}
                  bounty={bounty}
                  wallet={wallet}
                  cancelBounty={cancelBounty}
                  refreshBounties={refreshBounties}
                  showClaim={true}
                />
              ))}
          </div>
          <ToastContainer />
        </div>
      )
      }
    </div >
  );
}

MyBounties.propTypes = {
  userBounties: PropTypes.array.isRequired,
  wallet: PropTypes.object,
  connect: PropTypes.func.isRequired,
  disconnect: PropTypes.func.isRequired,
  connecting: PropTypes.bool.isRequired,
  fetchUserBounties: PropTypes.func.isRequired,
  cancelBounty: PropTypes.func.isRequired,
  userSummary: PropTypes.object.isRequired,
  getClaimsByBountyId: PropTypes.func.isRequired,
  fetchBountyDetails: PropTypes.func.isRequired,
  getTokenUri: PropTypes.func.isRequired,
  acceptClaim: PropTypes.func.isRequired,
  createNftCards: PropTypes.func.isRequired,
  userNftCards: PropTypes.array.isRequired,
};

export default MyBounties;
