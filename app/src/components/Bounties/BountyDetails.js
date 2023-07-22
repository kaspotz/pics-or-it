import React, { useEffect, useState } from 'react';
import ClaimCard from '../Claims/ClaimCard';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';

function BountyDetails({ getTokenUri, getClaimsByBountyId }) {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [userClaims, setUserClaims] = useState([]);

  useEffect(() => {
    (async () => {
      const claims = await getClaimsByBountyId(id);
      setUserClaims(claims);
      setLoading(false);
    })();
  }, [id]);

  return (
    <div className="bounty-details-wrap">
      <div className="bounty-details-left">
        <h1>Bounty Details</h1>
        <p>Bounty ID: {id}</p>
      </div>
      <div className="bounties-grid bounty-details-right">
        {loading ? (
          <div>Loading...</div>
        ) : (
          userClaims.map(claim => (
            <ClaimCard
              key={claim.id}
              bountyId={id}
              claim={claim}
              getTokenUri={getTokenUri}
            />
          ))
        )}
      </div>
    </div>
  );
}

BountyDetails.propTypes = {
  getTokenUri: PropTypes.func.isRequired,
  getClaimsByBountyId: PropTypes.func.isRequired,
};

export default BountyDetails;
