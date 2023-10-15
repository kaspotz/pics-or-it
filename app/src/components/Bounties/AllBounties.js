import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import BountyCard from './BountyCard';
import { toast, ToastContainer } from 'react-toastify';

function MyBounties({
  unClaimedBounties,
  fetchAllBounties,
  cancelBounty,
  wallet,
  connect,
  disconnect,
  connecting,
}) {
  const refreshBounties = useCallback(
    toToast => {
      if (wallet) {
        fetchAllBounties();
        if (toToast) {
          toast.success('Bounty cancelled successfully!');
        }
      }
    },
    [wallet, fetchAllBounties]
  );

  useEffect(() => {
    refreshBounties();
  }, []);

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
        <>
          <div className="bounties-grid">
            {unClaimedBounties
              .filter(bounty => bounty.amount > 0)
              .map(bounty => (
                <BountyCard
                  key={bounty.id}
                  bounty={bounty}
                  wallet={wallet}
                  cancelBounty={cancelBounty}
                  refreshBounties={refreshBounties}
                />
              ))}
          </div>
          <ToastContainer />
        </>
      )}
    </div>
  );
}

MyBounties.propTypes = {
  unClaimedBounties: PropTypes.array.isRequired,
  wallet: PropTypes.object,
  connect: PropTypes.func.isRequired,
  disconnect: PropTypes.func.isRequired,
  connecting: PropTypes.bool.isRequired,
  fetchAllBounties: PropTypes.func.isRequired,
  cancelBounty: PropTypes.func.isRequired,
};

export default MyBounties;
