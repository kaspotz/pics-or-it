// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract POIDHNFT is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    IERC721Receiver
{
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    /** Bounty Logic */
    struct Bounty {
        uint256 id;
        address issuer;
        string name;
        string description;
        uint256 amount;
        address claimer;
        string claimUri;
        uint256 createdAt;
    }

    Bounty[] public bounties;
    mapping(address => uint256[]) public userBounties;

    /** Claim Logic */
    struct Claim {
        uint256 id;
        address issuer;
        uint256 bountyId;
        address bountyIssuer;
        string name;
        string description; // new field
        uint256 tokenId;
        uint256 createdAt;
    }

    Claim[] public claims;
    mapping(address => uint256[]) public userClaims;
    mapping(uint256 => uint256[]) public bountyClaims;

    constructor() ERC721("Pics or it didn't happen", "POIDH") {}

    /** Create a bounty from the sender */
    function createBounty(
        string memory name,
        string memory description
    ) public payable {
        require(msg.value > 0, "Bounty amount must be greater than 0");

        uint256 bountyId = bounties.length;

        Bounty memory bounty = Bounty(
            bountyId,
            msg.sender,
            name,
            description,
            msg.value,
            address(0),
            "",
            block.timestamp
        );
        bounties.push(bounty);

        // Store the bounty index in the user's array
        userBounties[msg.sender].push(bountyId);
    }

    function createClaim(
        uint256 bountyId,
        string memory name,
        string memory uri,
        string memory description
    ) public {
        require(bountyId < bounties.length, "Bounty does not exist");
        require(
            bounties[bountyId].claimer == address(0),
            "Bounty already claimed"
        );
        require(bounties[bountyId].amount > 0, "Bounty has no amount");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        uint256 claimId = claims.length;

        Claim memory claim = Claim(
            claimId,
            msg.sender,
            bountyId,
            bounties[bountyId].issuer,
            name,
            description, // new field
            tokenId,
            block.timestamp
        );

        claims.push(claim);
        userClaims[msg.sender].push(claimId);
        bountyClaims[bountyId].push(claimId);

        _safeMint(address(this), tokenId);
        _setTokenURI(tokenId, uri);
    }

    /** Returns all claims for a given bountyId */
    function getClaimsByBountyId(
        uint256 bountyId
    ) public view returns (Claim[] memory) {
        uint256[] storage bountyClaimIndexes = bountyClaims[bountyId];
        Claim[] memory bountyClaimsArray = new Claim[](
            bountyClaimIndexes.length
        );

        for (uint256 i = 0; i < bountyClaimIndexes.length; i++) {
            bountyClaimsArray[i] = claims[bountyClaimIndexes[i]];
        }

        return bountyClaimsArray;
    }

    /** Returns all bounties for a given user */
    function getBountiesByUser(
        address user
    ) public view returns (Bounty[] memory) {
        uint256[] storage userBountyIndexes = userBounties[user];
        Bounty[] memory userBountiesArray = new Bounty[](
            userBountyIndexes.length
        );

        for (uint256 i = 0; i < userBountyIndexes.length; i++) {
            userBountiesArray[i] = bounties[userBountyIndexes[i]];
        }

        return userBountiesArray;
    }

    /** Returns all claims for a given user */
    function getClaimsByUser(
        address user
    ) public view returns (Claim[] memory) {
        uint256[] storage userClaimIndexes = userClaims[user];
        Claim[] memory userClaimsArray = new Claim[](userClaimIndexes.length);

        for (uint256 i = 0; i < userClaimIndexes.length; i++) {
            userClaimsArray[i] = claims[userClaimIndexes[i]];
        }

        return userClaimsArray;
    }

    /** Bounty issuer can accept a given claim on their bounty */
    function acceptClaim(uint256 bountyId, uint256 claimId) public {
        require(bountyId < bounties.length, "Bounty does not exist");
        require(claimId < claims.length, "Claim does not exist");

        Bounty storage bounty = bounties[bountyId];
        require(bounty.claimer == address(0), "Bounty already claimed");
        require(
            bounty.issuer == msg.sender,
            "Only the bounty issuer can accept a claim"
        );
        require(
            bounty.amount <= address(this).balance,
            "Bounty amount is greater than contract balance"
        );

        address claimIssuer = claims[claimId].issuer;
        uint256 bountyAmount = bounty.amount;
        uint256 tokenId = claims[claimId].tokenId;

        // Close out the bounty
        bounty.claimer = claimIssuer;
        bounty.claimUri = tokenURI(tokenId);

        // Store the claim issuer and bounty amount for use after external calls
        address payable pendingPayee = payable(claimIssuer);
        uint256 pendingPayment = bountyAmount;

        // Transfer the claim NFT to the bounty issuer
        _safeTransfer(address(this), msg.sender, tokenId, "");

        // Finally, transfer the bounty amount to the claim issuer
        pendingPayee.transfer(pendingPayment);
    }

    // The following functions are overrides required by Solidity.
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    /** Getter for the length of the bounties array */
    function getBountiesLength() public view returns (uint256) {
        return bounties.length;
    }
}
