import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

function ClaimCard({ claim }) {
  const { id, name, issuer } = claim

  return (
    <div className="claim-card">
      <h3>{name}</h3>
      <p>Issuer: {issuer}</p>
      <Link to={`/claims/${id}`}>View Details</Link>
    </div>
  )
}

ClaimCard.propTypes = {
  claim: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    issuer: PropTypes.string.isRequired,
  }).isRequired,
}

export default ClaimCard
