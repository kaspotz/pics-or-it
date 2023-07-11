import React from 'react'
import PropTypes from 'prop-types'
import ClaimCard from '../Claims/ClaimCard'
import { claims } from '../../temp'

function BountyDetails({ bounty }) {
  const { id } = bounty.params

  return (
    <div>
      <h1>Bounty Details</h1>
      <p>Bounty ID: {id}</p>
      {claims.map((claim) => {
        ;<ClaimCard key={claim.id} claim={claim} />
      })}
    </div>
  )
}

BountyDetails.propTypes = {
  bounty: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
}

export default BountyDetails
