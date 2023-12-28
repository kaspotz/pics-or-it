import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import BountyCard from './BountyCard';
import { ToastContainer } from 'react-toastify';
import BountyCreation from './BountyCreation';
import { ZeroAddress, ethers } from 'ethers';

const BOUNTIES_PER_PAGE = 18;

/**
 * Fetches a list of unclaimed bounties from the blockchain.
 *
 * @param {object} connectedContract - The contract instance to interact with the blockchain.
 * @param {number|null} count - The maximum number of bounties to fetch. If null, fetches as many as possible.
 * @param {number} startIndex - The starting index from which to fetch the bounties.
 * @returns An object containing the list of fetched bounties, a boolean indicating if more bounties are available, and the last index processed.
 */
const fetchBounties = async (
  connectedContract,
  count = null,
  doneBountiesFilter = true,
  startIndex = null,
) => {
  try {
    if (connectedContract) {
      // Get the total number of bounties and adjust for zero-based indexing
      const allBountiesLength =
        Number(await connectedContract.getBountiesLength()) - 1;
      let unclaimedBounties = [];
      // Start fetching from the provided startIndex
      let index = startIndex || allBountiesLength;
      const batchSize = 20; // Number of bounties to fetch in each batch
      let hasMore = true; // Indicates if more bounties are available
      let lastIndex = index; // Keeps track of the last index processed

      while (index >= 0 && index <= allBountiesLength) {
        // Calculate the range of indices for the current batch
        const start = Math.max(0, index - batchSize + 1);
        const end = index;

        // Fetch a batch of bounties from the contract
        const bountyBatch = await connectedContract.getBounties(start, end);
        // Process and filter the fetched bounties
        const filteredBounties = bountyBatch
          .map(bounty => ({
            id: Number(bounty.id),
            issuer: bounty.issuer,
            name: bounty.name,
            description: bounty.description,
            amount: Number(ethers.formatEther(bounty.amount)),
            claimer: bounty.claimer,
            claimId: bounty.claimId,
            createdAt: Number(bounty.createdAt),
          }))
          .filter(bounty =>
            doneBountiesFilter
              ? bounty.claimer === ZeroAddress && bounty.amount > 0
              : bounty.claimer !== ZeroAddress && bounty.amount > 0
          );
        unclaimedBounties = [...filteredBounties, ...unclaimedBounties];

        // Check if enough bounties have been fetched or if the start of the array is reached
        if (
          (count !== null && unclaimedBounties.length >= count) ||
          start === 0
        ) {
          // Sort bounties by creation date
          unclaimedBounties.sort((a, b) => b.createdAt - a.createdAt);
          // Update hasMore to indicate if there are more bounties to fetch
          hasMore = start > 0;

          // If more bounties are fetched than requested, adjust the count and lastIndex
          if (count !== null && unclaimedBounties.length > count) {
            // Calculate the correct lastIndex after trimming the array
            lastIndex = start + unclaimedBounties.length - count - 1;
            // Trim the array to the requested size
            unclaimedBounties = unclaimedBounties.slice(0, count);
          }
          break;
        }

        // Update lastIndex for the next iteration
        lastIndex = start - 1;
        // Move to the next batch
        index -= batchSize;
      }
      return {
        bounties: unclaimedBounties,
        hasMore,
        lastIndex,
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
  const [hasMore, setHasMore] = useState(true);

  const [offset, setOffset] = useState(0);
  const [isUpdating, setIsUpdating] = useState(true);
  const intervalId = useRef();

  const [doneBountiesOnly, setDoneBountiesOnly] = useState(true);
  const [activeButton, setActiveButton] = useState('first');

  useEffect(() => {
    const fetchInitialBounties = async () => {
      const contract = await getContract();
      // Fetch BOUNTIES_PER_PAGE bounties when the component mounts
      const { bounties, hasMore, lastIndex } = await fetchBounties(
        contract,
        BOUNTIES_PER_PAGE,
        doneBountiesOnly
      );
      setBounties(bounties);
      setHasMore(hasMore);
      setOffset(lastIndex);
    };

    fetchInitialBounties();
  }, []);


  // useEffect(() => {
  //   const updateBounties = async () => {
  //     const contract = await getContract();

  //     // Fetch all unclaimed bounties.
  //     const { bounties: unclaimedBounties } = await fetchBounties(contract);
  //     if (!unclaimedBounties?.length) return;
  //     const unclaimedSet = new Set(unclaimedBounties.map(b => b.id));

  //     // Filter out bounties not in the unclaimed set
  //     const updatedBounties = bounties?.filter(b => unclaimedSet.has(b.id));

  //     // Sort updatedBounties by createdAt in descending order
  //     updatedBounties.sort((a, b) => b.createdAt - a.createdAt);

  //     // Get the latest timestamp from the current bounties
  //     const latestTimestamp =
  //       updatedBounties.length > 0 ? updatedBounties[0].createdAt : 0;
  //     // Filter new bounties based on timestamp
  //     const newBounties = unclaimedBounties.filter(
  //       b => b.createdAt > latestTimestamp
  //     );

  //     // Add new bounties to the beginning of the array
  //     setBounties([...newBounties, ...updatedBounties]);
  //   };

  //   if (isUpdating) {
  //     intervalId.current = setInterval(updateBounties, 5000);
  //   }

  //   // Cleanup function
  //   return () => clearInterval(intervalId.current);
  // }, [bounties, isUpdating]);

  const handleCreateBounty = () => {
    setShowCreateBounty(!showCreateBounty);
  };

  const loadMoreBounties = async () => {
    setIsUpdating(false);
    const contract = await getContract();

    const {
      bounties: moreBounties,
      hasMore,
      lastIndex,
    } = await fetchBounties(
      contract,
      BOUNTIES_PER_PAGE,
      doneBountiesOnly,
      offset,
    );

    setBounties([...bounties, ...moreBounties]);
    setHasMore(hasMore);
    setOffset(lastIndex);
    setIsUpdating(true);
    console.log("isUpdating: ", isUpdating);
    console.log("intervalId: ", intervalId);
  };

  const bountyFilter = async (value) => {
    console.log("hi kenny the value is: ", value);
    setDoneBountiesOnly(value);

    // fetches bounties with initial load parameters to mimic page refresh.
    const contract = await getContract();
    const { bounties, hasMore, lastIndex } = await fetchBounties(
      contract,
      BOUNTIES_PER_PAGE,
      value
    );
    setBounties(bounties);
    setHasMore(hasMore);
    setOffset(lastIndex);
  }

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
          <div>
            <div>
              <button className={`bounty-filter-button ${activeButton === 'first' ? 'active' : ''}`}
                onClick={() => {
                  bountyFilter(true);
                  setActiveButton('first');
                }}
                style={{
                  backgroundColor: activeButton === 'first' ? '#c24648' : '#f4595b'
                }}
              >
                open to claim</button>
              <button className={`bounty-filter-button ${activeButton === 'second' ? 'active' : ''}`}
                onClick={() => {
                  bountyFilter(false);
                  setActiveButton('second');
                }}
                style={{
                  backgroundColor: activeButton === 'second' ? '#c24648' : '#f4595b'
                }}
              >
                past bounties</button>
            </div>
          </div>
          <div className="bounties-grid all-bounties-grid">
            {bounties
              ?.filter(bounty => bounty.amount > 0)
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
            {hasMore && <button onClick={loadMoreBounties}>load more</button>}
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
