import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { useContract } from '../../web3'

function MyClaims({
  fetchUserClaims,
  wallet,
  connect,
  disconnect,
  connecting,
}) {
  const { userClaims } = useContract()

  useEffect(() => {
    if (wallet) {
      fetchUserClaims()
    }
  }, [wallet])

  return (
    <div>
      <h1>My Claims</h1>
      {!wallet ? (
        <div>
          <h2>Connect your wallet to view your claims</h2>
          <button
            disabled={connecting}
            onClick={() =>
              wallet ? disconnect({ label: wallet.label }) : connect()
            }
          >
            {connecting ? 'Connecting' : wallet ? 'Disconnect' : 'Connect'}
          </button>
        </div>
      ) : (
        userClaims.map((claim) => (
          <div key={claim.id}>
            <h3>{claim.name}</h3>
            <p>Issuer: {claim.issuer}</p>
            <p>Bounty ID: {claim.bountyId}</p>
            <p>Bounty Issuer: {claim.bountyIssuer}</p>
            <p>Token ID: {claim.tokenId}</p>
            <p>Created At: {claim.createdAt}</p>
          </div>
        ))
      )}
    </div>
  )
}

MyClaims.propTypes = {
  fetchUserClaims: PropTypes.func.isRequired,
  wallet: PropTypes.object,
  connect: PropTypes.func.isRequired,
  disconnect: PropTypes.func.isRequired,
  connecting: PropTypes.bool.isRequired,
}

export default MyClaims
