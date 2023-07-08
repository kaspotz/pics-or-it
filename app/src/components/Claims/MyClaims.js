import React from 'react'
import { useContract } from '../../web3'

function MyClaims() {
  const { userClaims } = useContract()

  return (
    <div>
      <h1>My Claims</h1>
      {userClaims.map((claim) => (
        <div key={claim.id}>
          <h3>{claim.name}</h3>
          <p>Issuer: {claim.issuer}</p>
          {/* Render additional claim details */}
        </div>
      ))}
    </div>
  )
}

export default MyClaims
