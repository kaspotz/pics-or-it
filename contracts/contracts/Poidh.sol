// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";


contract POIDHNFT is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    IERC721Receiver,
    ERC721Royalty
{
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    address public treasury;

    /** Bounty Logic */
    struct Bounty {
        uint256 id;
        address issuer;
        string name;
        string description;
        uint256 amount;
        address claimer;
        uint256 createdAt;
        uint256 claimId;
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

    event BountyCreated(
        uint256 bountyId,
        address indexed issuer,
        string name,
        string description,
        uint256 amount,
        uint256 createdAt
    );
    event ClaimCreated(
        uint256 claimId,
        address indexed issuer,
        uint256 bountyId,
        address bountyIssuer,
        string name,
        string description,
        uint256 tokenId,
        uint256 createdAt
    );
    event ClaimAccepted(
        uint256 bountyId,
        uint256 claimId,
        address claimIssuer,
        address bountyIssuer,
        uint256 fee
    );
    event BountyCancelled(uint256 bountyId, address issuer);

    /**
        * @dev Constructor function
        * @param _treasury the address of the treasury wallet
        * @param _feeNumerator the fee numerator for the royalty (1000 ~ 10%)
     */
    constructor(address _treasury, uint96 _feeNumerator) ERC721("pics or it didn't happen", "POIDH") {
        treasury = _treasury;
        _setDefaultRoyalty(_treasury, _feeNumerator);
    }

    /* === WRITE FUNCTIONS === */
    /**
     * @dev Allows the sender to create a bounty with a given name and description
     * @param name the name of the bounty
     * @param description the description of the bounty
     */ function createBounty(
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
            block.timestamp,
            0
        );
        bounties.push(bounty);

        // Store the bounty index in the user's array
        userBounties[msg.sender].push(bountyId);

        emit BountyCreated(
            bountyId,
            msg.sender,
            name,
            description,
            msg.value,
            block.timestamp
        );
    }

    /**
     * @dev Allows the sender to cancel a bounty with a given id
     * @param id the id of the bounty to be canceled
     */
    function cancelBounty(uint id) external {
        require(id < bounties.length, "Bounty does not exist");
        Bounty storage bounty = bounties[id];
        require(
            msg.sender == bounty.issuer,
            "Only the bounty issuer can cancel the bounty"
        );
        require(bounty.claimer == address(0), "Bounty already claimed");

        uint refundAmount = bounty.amount;
        bounty.amount = 0; // Zero out the bounty before transferring
        bounty.claimer = address(0); // Zero out the claimer before transferring

        payable(bounty.issuer).transfer(refundAmount);

        emit BountyCancelled(id, bounty.issuer);
    }

    /**
     * @dev Allows the sender to create a claim on a given bounty
     * @param bountyId the id of the bounty being claimed
     * @param name the name of the claim
     * @param uri the URI of the claim
     * @param description the description of the claim
     */
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

        _mint(address(this), tokenId);
        _setTokenURI(tokenId, uri);

        emit ClaimCreated(
            claimId,
            msg.sender,
            bountyId,
            bounties[bountyId].issuer,
            name,
            description,
            tokenId,
            block.timestamp
        );
    }

    /**
     * @dev Allows the sender to accept a claim on their bounty
     * @param bountyId the id of the bounty being claimed
     * @param claimId the id of the claim being accepted
     */
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
        bounty.claimId = claimId;

        // Calculate the fee (2.5% of bountyAmount)
        uint256 fee = (bountyAmount * 25) / 1000;

        // Subtract the fee from the bountyAmount
        uint256 payout = bountyAmount - fee;

        // Store the claim issuer and bounty amount for use after external calls
        address payable pendingPayee = payable(claimIssuer);
        uint256 pendingPayment = payout;

        // Store the treasury address for use after external calls
        address payable t = payable(treasury); // replace 'treasury_address_here' with your actual treasury address

        // Transfer the claim NFT to the bounty issuer
        _safeTransfer(address(this), msg.sender, tokenId, "");

        // Finally, transfer the bounty amount to the claim issuer
        pendingPayee.transfer(pendingPayment);

        // Transfer the fee to the treasury wallet
        t.transfer(fee);

        emit ClaimAccepted(bountyId, claimId, claimIssuer, bounty.issuer, fee); // update event parameters to include the fee
    }

    /* === GETTER FUNCTIONS === */
    /** 
        @dev Returns all claims associated with a bounty
        @param bountyId the id of the bounty to fetch claims for 
    */
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

    /** 
        @dev Returns all bounties for a given user 
        @param user the address of the user to fetch bounties for
    */
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

    /** 
        @dev Returns all claims for a given user 
        @param user the address of the user to fetch claims for
    */
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

    /** Getter for the length of the bounties array */
    function getBountiesLength() public view returns (uint256) {
        return bounties.length;
    }

    /**
     * @dev Returns an array of Bounties from start to end index
     * @param start the index to start fetching bounties from
     * @param end the index to stop fetching bounties at
     * @return result an array of Bounties from start to end index
     */
    function getBounties(
        uint start,
        uint end
    ) public view returns (Bounty[] memory) {
        require(
            start <= end,
            "Start index must be less than or equal to end index"
        );
        require(end < bounties.length, "End index out of bounds");

        // Calculate the size of the array to return
        uint size = end - start + 1;
        // Initialize an array of Bounties with the calculated size
        Bounty[] memory result = new Bounty[](size);

        // Loop from start to end index and populate the result array
        for (uint i = 0; i < size; i++) {
            result[i] = bounties[start + i];
        }

        return result;
    }

    /* === OVERRIDES === */
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
    ) internal override(ERC721, ERC721URIStorage, ERC721Royalty) {
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
        override(ERC721, ERC721Enumerable, ERC721URIStorage, ERC721Royalty)
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
}
