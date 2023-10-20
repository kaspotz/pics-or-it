import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import BountyCard from './BountyCard';
import { ToastContainer } from 'react-toastify';
import BountyCreation from './BountyCreation';

function AllBounties({
  unClaimedBounties,
  fetchAllBounties,
  cancelBounty,
  wallet,
  connect,
  disconnect,
  connecting,
  userBalance,
}) {
  const [showCreateBounty, setShowCreateBounty] = useState(false);
  const [firstRender, setFirstRender] = useState(true);

  const intervalId = useRef(); // Using a ref to persist the interval ID

  useEffect(() => {
    if (wallet) fetchAllBounties();
  }, [wallet]);

  useEffect(() => {
    if (unClaimedBounties.length == 0 && firstRender) {
      intervalId.current = setInterval(fetchAllBounties, 5000);

      setFirstRender(false);
    }

    if (unClaimedBounties.length > 0) {
      clearInterval(intervalId.current);
    }

    // cleanup function on component unmount
    return () => clearInterval(intervalId.current);
  }, [unClaimedBounties]);

  const handleCreateBounty = () => {
    setShowCreateBounty(!showCreateBounty);
  };

  return (
    <div className="my-bounties-wrap">
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
              {!wallet ? (
                <div className="bounty-details-connect-claim-button-wrap">
                  <button
                    disabled={connecting}
                    onClick={() =>
                      wallet ? disconnect({ label: wallet.label }) : connect()
                    }
                  >
                    {connecting
                      ? 'connecting'
                      : wallet
                      ? 'disconnect'
                      : 'connect'}
                  </button>
                </div>
              ) : (
                !showCreateBounty && (
                  <div className="bounty-details-connect-claim-button-wrap">
                    <button onClick={() => handleCreateBounty()}>
                      create bounty
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
          <div className="bounties-grid all-bounties-grid">
            {unClaimedBounties
              .filter(bounty => bounty.amount > 0)
              .sort((a, b) => b.createdAt - a.createdAt)
              .map(bounty => (
                <BountyCard
                  key={bounty.id}
                  bounty={bounty}
                  wallet={wallet}
                  cancelBounty={cancelBounty}
                  refreshBounties={fetchAllBounties}
                  showClaim={false}
                />
              ))}
          </div>
        </div>
        <ToastContainer />
        {showCreateBounty && (
          <div className="bounty-creation-wrapper">
            <BountyCreation
              userBalance={userBalance}
              handleClose={handleCreateBounty}
            />
          </div>
        )}
      </>
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
  userBalance: PropTypes.string.isRequired,
};

export default AllBounties;
