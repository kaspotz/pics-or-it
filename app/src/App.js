import React from 'react';
import { useContract } from './web3/index.js';
import Navigation from './components/Navigation';
import Home from './components/Home';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MyBounties from './components/Bounties/MyBounties.js';
import BountyDetails from './components/Bounties/BountyDetails.js';

function App() {
  const {
    wallet,
    connect,
    disconnect,
    connecting,
    userBounties,
    fetchUserBounties,
    getClaimsByBountyId,
    getTokenUri,
    fetchBountyDetails,
    acceptClaim,
    cancelBounty,
  } = useContract();

  return (
    <Router basename="/">
      <div>
        <Navigation />
        <Routes>
          <Route
            path="/"
            element={
              <Home
                wallet={wallet}
                connect={connect}
                disconnect={disconnect}
                connecting={connecting}
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
