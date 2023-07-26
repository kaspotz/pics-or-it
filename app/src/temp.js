// Fake Bounties data
const bounties = [
  {
    id: 0,
    issuer: '0x1234567890abcdef1234567890abcdef12345678',
    name: 'Bounty 1',
    description: 'Description 1',
    amount: 100,
    claimer: '0x9876543210fedcba9876543210fedcba98765432',
    claimUri: 'https://example.com/claim1',
    createdAt: 1628270495,
  },
  {
    id: 1,
    issuer: '0x9876543210fedcba9876543210fedcba98765432',
    name: 'Bounty 2',
    description: 'Description 2',
    amount: 200,
    claimer: '0x1234567890abcdef1234567890abcdef12345678',
    claimUri: 'https://example.com/claim2',
    createdAt: 1628270578,
  },
];

// Fake Claims data
const claims = [
  {
    id: 0,
    issuer: '0x9876543210fedcba9876543210fedcba98765432',
    bountyId: 0,
    bountyIssuer: '0x1234567890abcdef1234567890abcdef12345678',
    name: 'Claim 1',
    tokenId: 1000,
    createdAt: 1628270643,
  },
  {
    id: 1,
    issuer: '0x1234567890abcdef1234567890abcdef12345678',
    bountyId: 1,
    bountyIssuer: '0x9876543210fedcba9876543210fedcba98765432',
    name: 'Claim 2',
    tokenId: 1001,
    createdAt: 1628270702,
  },
];

export { bounties, claims };
