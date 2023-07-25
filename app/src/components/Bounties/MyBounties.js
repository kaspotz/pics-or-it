import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import BountyCard from './BountyCard';

function MyBounties({
  userBounties,
  fetchUserBounties,
  cancelBounty,
  wallet,
  connect,
  disconnect,
  connecting,
}) {
  useEffect(() => {
    if (wallet) {
      fetchUserBounties();
    }
  }, [wallet]);

  return (
    <div className="bounties-grid">
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
        userBounties.map(bounty => (
          <BountyCard
            key={bounty.id}
            bounty={bounty}
            wallet={wallet}
            cancelBounty={cancelBounty}
          />
        ))
      )}
    </div>
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
};

export default MyBounties;
