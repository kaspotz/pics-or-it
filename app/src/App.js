import React, { useEffect } from 'react'
import { useContract } from './web3/index.js'
import Navigation from './components/Navigation'
import Home from './components/Home'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AllBounties from './components/Bounties/AllBounties.js'
import MyBounties from './components/Bounties/MyBounties.js'
import MyClaims from './components/Claims/MyClaims.js'

function App() {
  const {
    wallet,
    connect,
    disconnect,
    connecting
  } = useContract()

  useEffect(() => {
    if (wallet) {
      // fetchUserBounties()
      // fetchUserClaims()
    }
  }, [wallet])

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
          <Route path="/bounties" element={<AllBounties />} />
          <Route path="/my-bounties" element={<MyBounties />} />
          <Route path="/my-claims" element={<MyClaims />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
