import React from 'react';
import { useParams } from 'react-router-dom';

function ClaimDetails() {
  const { id } = useParams();
  console.log(id);
  // Fetch the specific claim details based on the ID

  return (
    <div>
      <h1>Claim Details</h1>
      {/* Render the claim details */}
    </div>
  );
}

export default ClaimDetails;
