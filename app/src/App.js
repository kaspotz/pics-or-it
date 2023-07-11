import React from 'react'
import { useContract } from './web3/index.js'
import Navigation from './components/Navigation'
import Home from './components/Home'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MyBounties from './components/Bounties/MyBounties.js'
import MyClaims from './components/Claims/MyClaims.js'

function App() {
  const {
    wallet,
    connect,
    disconnect,
    connecting,
    userBounties,
    userClaims,
    fetchUserBounties,
  } = useContract()

  return (
    <Router>
      <div>
        <Navigation />
        <Routes>
          <Route
            path="/pics-or-it"
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
              />
            }
          />
          <Route
            path="/my-claims"
            element={<MyClaims userClaims={userClaims} />}
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
