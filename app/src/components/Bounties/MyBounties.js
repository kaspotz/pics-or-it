import React, { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import BountyCard from './BountyCard';
import { toast, ToastContainer } from 'react-toastify';

function MyBounties({
  userBounties,
  fetchUserBounties,
  cancelBounty,
  wallet,
  connect,
  disconnect,
  connecting,
  userSummary
}) {
  const refreshBounties = useCallback(
    toToast => {
      if (wallet) {
        fetchUserBounties();
        if (toToast) {
          toast.success('Bounty cancelled successfully!');
        }
      }
    },
    [wallet, fetchUserBounties]
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      refreshBounties(false);
    }, 3000);

    // cleanup function on component unmount
    return () => clearInterval(intervalId);
  }, [refreshBounties]);

  return (
    <div className="my-bounties-wrap">
      {!wallet ? (
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
                  {userSummary.ethSpent}
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
                  {userSummary.ethInOpenBounties}
                </th>
              </tr>
            </table>
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
};

export default MyBounties;
