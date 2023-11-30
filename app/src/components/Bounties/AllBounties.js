import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import BountyCard from './BountyCard';
import { ToastContainer } from 'react-toastify';
import BountyCreation from './BountyCreation';
import { ZeroAddress, ethers } from 'ethers';

const BOUNTIES_PER_PAGE = 30;

const fetchBounties = async (connectedContract, offset = 0, limit) => {
  try {
    if (connectedContract) {
      const allBountiesLength =
        Number(await connectedContract.getBountiesLength()) - 1;

      let start, end;

      if (limit !== undefined) {
        // Calculate start and end index for slicing the bounties array based on the limit
        start = allBountiesLength - offset - limit;
        end = allBountiesLength - offset;
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
        return { bounties: [], unclaimedBountiesTotal: allBountiesLength };
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

      const unClaimedBounties = unfilteredBounties.filter(
        bounty => bounty.claimer === ZeroAddress
      );

      // Filter by unclaimed bounties if needed
      return {
        bounties: unClaimedBounties,
        unclaimedBountiesTotal: unClaimedBounties.length,
      };
    }
  } catch (error) {
    console.error('Error fetching bounties:', error);
  }
};

function AllBounties({
  fetchAllBounties,
  getContract,
  cancelBounty,
  wallet,
  connect,
  disconnect,
  connecting,
  userBalance,
}) {
  const [showCreateBounty, setShowCreateBounty] = useState(false);

  const [bounties, setBounties] = useState([true]);
  const [unclaimedBountiesTotal, setUnclaimedBountiesTotal] = useState();

  const [offset, setOffset] = useState(0);
  const [isUpdating, setIsUpdating] = useState(true);
  const intervalId = useRef();

  useEffect(() => {
    const fetchInitialBounties = async () => {
      const contract = await getContract();
      // Fetch BOUNTIES_PER_PAGE bounties when the component mounts
      const { bounties, unclaimedBountiesTotal } = await fetchBounties(
        contract,
        0,
        BOUNTIES_PER_PAGE
      );
      setBounties(bounties);

      setUnclaimedBountiesTotal(unclaimedBountiesTotal);
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
      const { bounties: unclaimedBounties, unclaimedBountiesTotal } =
        await fetchBounties(contract);
      if (!unclaimedBounties?.length) return;
      const unclaimedSet = new Set(unclaimedBounties.map(b => b.id));

      // Filter out bounties not in the unclaimed set
      const updatedBounties = bounties?.filter(b => unclaimedSet.has(b.id));

      // Sort updatedBounties by createdAt in descending order
      updatedBounties.sort((a, b) => b.createdAt - a.createdAt);

      // Get the latest timestamp from the current bounties
      const latestTimestamp =
        updatedBounties.length > 0 ? updatedBounties[0].createdAt : 0;

      unclaimedBounties.sort((a, b) => b.createdAt - a.createdAt);
      // Filter new bounties based on timestamp
      const newBounties = unclaimedBounties.filter(
        b => b.createdAt > latestTimestamp
      );

      // Add new bounties to the beginning of the array
      setBounties([...newBounties, ...updatedBounties]);
      setUnclaimedBountiesTotal(unclaimedBountiesTotal);
    };

    if (wallet && isUpdating) {
      intervalId.current = setInterval(updateBounties, 5000);
    }

    // Cleanup function
    return () => clearInterval(intervalId.current);
  }, [wallet, bounties, isUpdating]);

  const handleCreateBounty = () => {
    setShowCreateBounty(!showCreateBounty);
  };

  const loadMoreBounties = async () => {
    setIsUpdating(false);
    const contract = await getContract();
    const { bounties: moreBounties } = await fetchBounties(
      contract,
      offset + BOUNTIES_PER_PAGE,
      BOUNTIES_PER_PAGE
    );
    setBounties([...bounties, ...moreBounties]);

    setUnclaimedBountiesTotal(unclaimedBountiesTotal);
    setOffset(offset + BOUNTIES_PER_PAGE);
    setIsUpdating(true);
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
              ?.filter(bounty => bounty.amount > 0)
              .sort((a, b) => b.createdAt - a.createdAt)
              .map((bounty, index) => (
                <BountyCard
                  key={index}
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
            {offset < unclaimedBountiesTotal && (
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
  getContract: PropTypes.func.isRequired,
};

export default AllBounties;
