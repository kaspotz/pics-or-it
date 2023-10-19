import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import BountyCard from './BountyCard';
import { ToastContainer } from 'react-toastify';

function AllBounties({
  unClaimedBounties,
  fetchAllBounties,
  cancelBounty,
  wallet,
  connect,
  disconnect,
  connecting,
}) {
  const [showCreateBounty, setShowCreateBounty] = useState(false);

  useEffect(() => {
    if (wallet) fetchAllBounties();
  }, [wallet]);

  useEffect(() => {
    console.log('unclaimed bounties', unClaimedBounties);
  }, [unClaimedBounties]);

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
          <div className="all-bounties-wrap">
            <div className="all-bounties-control">
              <div className="all-bounties-header">
                <h1 data-aos="fade-in">pics or it didn&#39;t happen</h1>
                <header data-aos="fade-in">
                  <h1>📸🧾</h1>
                </header>
              </div>
              <div className="all-bounties-action">
                {!showCreateBounty && (
                  <div className="bounty-details-connect-claim-button-wrap">
                    <button onClick={() => {}}>claim</button>
                  </div>
                )}
              </div>
            </div>
            <div className="bounties-grid all-bounties-grid">
              {unClaimedBounties
                .filter(bounty => bounty.amount > 0)
                .map(bounty => (
                  <BountyCard
                    key={bounty.id}
                    bounty={bounty}
                    wallet={wallet}
                    cancelBounty={cancelBounty}
                    refreshBounties={fetchAllBounties}
                  />
                ))}
            </div>
          </div>
          <ToastContainer />
        </>
      )}
    </div>
  );
}

AllBounties.propTypes = {
  unClaimedBounties: PropTypes.array.isRequired,
  wallet: PropTypes.object,
  connect: PropTypes.func.isRequired,
  disconnect: PropTypes.func.isRequired,
  connecting: PropTypes.bool.isRequired,
  fetchAllBounties: PropTypes.func.isRequired,
  cancelBounty: PropTypes.func.isRequired,
};

export default AllBounties;
