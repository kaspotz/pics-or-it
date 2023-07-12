import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import arbitrumLogo from '../../assets/arbitrum.png'
import CreateClaim from '../Claims/CreateClaim'

function BountyCard({ bounty }) {
  const { id, name, description, amount } = bounty

  const truncatedDescription =
    description.length > 50
      ? `${description.substr(0, 10)}...${description.substr(
          description.length - 20,
          description.length,
        )}`
      : description

  const [showCreateClaim, setShowCreateClaim] = useState(false)

  const handleClaimClick = () => {
    setShowCreateClaim(true)
  }

  const handleCloseCreateClaim = () => {
    setShowCreateClaim(false)
  }

  return (
    <div className="bounty-card">
      <div className="bounty-card-title-amount-wrap">
        <div className="bounty-title">{name}</div>
        <div className="bounty-card-amount-wrap">
          <img
            className="bounty-card-amount-logo"
            src={arbitrumLogo}
            alt="Arbitrum logo"
          />
          <p className="bounty-card-amount">{amount}</p>
        </div>
      </div>
      <p className="bounty-description">{truncatedDescription}</p>
      <div className="bounty-details-button-wrap">
        <button
          type="button"
          className="bounty-details-button"
          onClick={handleClaimClick}
        >
          claim
        </button>
        <Link to={`/bounties/${id}`}>
          <button type="button" className="bounty-details-button">
            details
          </button>
        </Link>
      </div>
      {showCreateClaim && (
        <CreateClaim bountyId={id} onClose={handleCloseCreateClaim} />
      )}
    </div>
  )
}

BountyCard.propTypes = {
  bounty: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
  }).isRequired,
}

export default BountyCard
