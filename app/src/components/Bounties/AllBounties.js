import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import BountyCard from './BountyCard';
import { ToastContainer } from 'react-toastify';
import BountyCreation from './BountyCreation';

const fetchBounties = async (connectedContract, offset = 0, limit) => {
  try {
    if (connectedContract) {
      const allBountiesLength =
        Number(await connectedContract.getBountiesLength()) - 1;

      let start, end;

      if (limit !== undefined) {
        // Calculate start and end index for slicing the bounties array based on the limit
        start = allBountiesLength - offset - limit;
        end = allBountiesLength - offset - 1;
      } else {
        // If limit is not specified, fetch all bounties
        start = 0;
        end = allBountiesLength;
      }

      // Ensure start and end indices are within the bounds of the array
      start = Math.max(start, 0);
      end = Math.min(end, allBountiesLength);

      // If offset is beyond the total number of bounties, return an empty array
      if (start > allBountiesLength) {
        return [];
      }

      const bounties = await connectedContract.getBounties(start, end);
      const unfilteredBounties = bounties.map(bounty => ({
        id: Number(bounty.id),
        issuer: bounty.issuer,
        name: bounty.name,
        description: bounty.description,
        amount: Number(ethers.formatEther(bounty.amount)),
        claimer: bounty.claimer,
        claimId: bounty.claimId,
        createdAt: Number(bounty.createdAt),
      }));

      // Filter by unclaimed bounties if needed
      return unfilteredBounties.filter(
        bounty => bounty.claimer === ZeroAddress
      );
    }
  } catch (error) {
    console.error('Error fetching bounties:', error);
  }
};

const BOUNTIES_PER_PAGE = 20;

function AllBounties({
  unClaimedBounties,
  fetchAllBounties,
  getContract,
  cancelBounty,
  wallet,
  connect,
  disconnect,
  connecting,
  userBalance,
}) {
  // fetchBounties
  const [showCreateBounty, setShowCreateBounty] = useState(false);
  const [firstRender, setFirstRender] = useState(true);
  const [bounties, setBounties] = useState([true]);

  const intervalId = useRef(); // Using a ref to persist the interval ID

  useEffect(() => {
    const fetchInitialBounties = async () => {
      const contract = await getContract();
      // Fetch BOUNTIES_PER_PAGE bounties when the component mounts
      const initialBounties = await fetchBounties(
        contract,
        0,
        BOUNTIES_PER_PAGE
      );
      setBounties(initialBounties);
    };

    if (wallet) {
      fetchInitialBounties();
    }
    // Run only once on mount when wallet is available
  }, [wallet]);

  useEffect(() => {
    const updateBounties = async () => {
      const contract = await getContract();

      // Fetch all unclaimed bounties.
      const allUnclaimedBounties = await fetchBounties(contract);

      const unclaimedSet = new Set(allUnclaimedBounties.map(b => b.id));

      // Filter out bounties not in the unclaimed set
      const updatedBounties = bounties.filter(b => unclaimedSet.has(b.id));

      // Get the latest timestamp from the current bounties
      const latestTimestamp =
        updatedBounties.length > 0 ? updatedBounties[0].createdAt : 0;

      // Filter new bounties based on timestamp
      const newBounties = allUnclaimedBounties.filter(
        b => b.createdAt > latestTimestamp
      );

      // Add new bounties to the beginning of the array
      setBounties([...newBounties, ...updatedBounties]);
    };

    if (wallet) {
      intervalId.current = setInterval(updateBounties, 5000);
    }

    // Cleanup function
    return () => clearInterval(intervalId.current);
  }, [wallet, bounties]);

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
            {bounties
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
          <div className="load-more-wrap">
            {/* Assuming you have no more bounties to load when the fetched list is empty */}
            {bounties.length % BOUNTIES_PER_PAGE === 0 &&
              bounties.length !== 0 && (
                <button onClick={loadMoreBounties}>Load More</button>
              )}
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
