import React from 'react'
import BountyCard from './BountyCard'
import { bounties } from '../../temp'

function AllBounties() {
  return (
    <div className="bounties-grid">
      {bounties.map((bounty) => (
        <BountyCard key={bounty.id} bounty={bounty} />
      ))}
    </div>
  )
}

export default AllBounties
