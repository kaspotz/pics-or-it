import React from 'react'
import { useContract } from '../../web3'

function MyBounties() {
  const { userBounties } = useContract()

  return (
    <div>
      <h1>My Bounties</h1>
      {userBounties.map((bounty) => (
        <div key={bounty.id}>
          <h3>{bounty.name}</h3>
          <p>Description: {bounty.description}</p>
          <p>Amount: {bounty.amount}</p>
          {/* Render additional bounty details */}
        </div>
      ))}
    </div>
  )
}

export default MyBounties
