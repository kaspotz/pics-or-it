import React, { useEffect } from 'react';
import { useContract } from './web3/index.js';
import Navigation from './components/Navigation';
import Home from './components/Home';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MyBounties from './components/Bounties/MyBounties.js';
import AllBounties from './components/Bounties/AllBounties.js';
import BountyDetails from './components/Bounties/BountyDetails.js';

function App() {
  const {
    wallet,
    connect,
    disconnect,
    connecting,
    userBounties,
    userBalance,
    fetchUserBounties,
    getClaimsByBountyId,
    getTokenUri,
    fetchBountyDetails,
    acceptClaim,
    cancelBounty,
    fetchUserClaims,
    fetchUserBalance,
    fetchAllBounties,
    unClaimedBounties,
    userSummary,
  } = useContract();

  useEffect(() => {
    if (wallet) {
      fetchUserBounties();
      fetchUserClaims();
      fetchUserBalance();
    }
  }, [wallet]);

  return (
    <Router basename="/">
      <div>
        <Navigation />
        <Routes>
          <Route
            path="/create"
            element={
              <Home
                wallet={wallet}
                connect={connect}
                disconnect={disconnect}
                connecting={connecting}
                userBalance={userBalance.toString()}
              />
            }
          />
          <Route
            path="/"
            element={
              <AllBounties
                unClaimedBounties={unClaimedBounties}
                wallet={wallet}
                connect={connect}
                disconnect={disconnect}
                connecting={connecting}
                fetchAllBounties={fetchAllBounties}
                cancelBounty={cancelBounty}
                userBalance={userBalance.toString()}
              />
            }
          />
          <Route
            path="/my-bounties"
            element={
              <MyBounties
                userBounties={userBounties}
                wallet={wallet}
                connect={connect}
                disconnect={disconnect}
                connecting={connecting}
                fetchUserBounties={fetchUserBounties}
                cancelBounty={cancelBounty}
                userSummary={userSummary}
              />
            }
          />
          <Route
            path="/bounties/:id"
            element={
              <BountyDetails
                wallet={wallet}
                connect={connect}
                disconnect={disconnect}
                connecting={connecting}
                getClaimsByBountyId={getClaimsByBountyId}
                getTokenUri={getTokenUri}
                fetchBountyDetails={fetchBountyDetails}
                acceptClaim={acceptClaim}
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
