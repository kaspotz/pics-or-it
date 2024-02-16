import React, { useEffect } from 'react';
import { useContract } from './web3/index.js';
import Navigation from './components/Navigation';
import Home from './components/Home';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MyBounties from './components/Bounties/MyBounties.js';
import AllBounties from './components/Bounties/AllBounties.js';
import BountyDetails from './components/Bounties/BountyDetails.js';
import Footer from './components/Footer';
import Terms from './components/Terms';
import { ArcxAnalyticsProvider } from '@arcxmoney/analytics'

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
    getContract,
    unClaimedBounties,
    claimedBounties,
    fetchUserSummary,
    userSummary,
    fetchClaimerBounties,
    createNftCards,
    userNftCards,
    userChainId,
  } = useContract();

  useEffect(() => {
    if (wallet?.provider) {
      fetchUserClaims();
      fetchUserBalance();
    }
  }, [wallet]);

  return (
    <ArcxAnalyticsProvider apiKey='17301c3747b41bb158b8f6dc99d3687688a292d7afecf6955ded49f047e1f828'>
      <Router basename="/">
        <div className="site-container">
          <div className="content-wrap">
            <Navigation
              wallet={wallet}
            />
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
                    fetchUserBounties={fetchUserBounties}
                    userBounties={userBounties}
                    userChainId={userChainId}
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
                    getContract={getContract}
                    cancelBounty={cancelBounty}
                    userBalance={userBalance.toString()}
                    fetchUserBounties={fetchUserBounties}
                    userBounties={userBounties}
                    userChainId={userChainId}
                  />
                }
              />
              <Route
                path="/my-bounties/:urlUserAddress"
                element={
                  <MyBounties
                    userBounties={userBounties}
                    wallet={wallet}
                    connect={connect}
                    disconnect={disconnect}
                    connecting={connecting}
                    fetchUserBounties={fetchUserBounties}
                    cancelBounty={cancelBounty}
                    fetchUserSummary={fetchUserSummary}
                    userSummary={userSummary}
                    getTokenUri={getTokenUri}
                    acceptClaim={acceptClaim}
                    fetchClaimerBounties={fetchClaimerBounties}
                    createNftCards={createNftCards}
                    userNftCards={userNftCards}
                    claimedBounties={claimedBounties}
                    fetchAllBounties={fetchAllBounties}
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
              <Route
                path="/terms"
                element={
                  <Terms
                  />
                }
              />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </ArcxAnalyticsProvider>
  );
}

export default App;
