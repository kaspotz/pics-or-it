import { useEffect, useState } from 'react';
import { ZeroAddress, ethers } from 'ethers';
import { init, useConnectWallet } from '@web3-onboard/react';
import injectedModule from '@web3-onboard/injected-wallets';
import { abi } from './abi.js';
import { PROVIDER_URL, CONTRACT } from './constants.js';
import { useSetChain } from '@web3-onboard/react';
import walletConnectModule from '@web3-onboard/walletconnect';
import { abiErc721Enumerable1 } from './abierc721enumerable1.js';

const injected = injectedModule();

const wcV2InitOptions = {
  projectId: '63d0f8d6472e57ec0c5ee760de5412f0',
  requiredChains: [42161],
  dappUrl: 'https://pics-or-it.com/',
};

const walletConnect = walletConnectModule(wcV2InitOptions);

// initialize Onboard
init({
  wallets: [injected, walletConnect],
  connect: {
    autoConnectLastWallet: true,
  },
  chains: [
    {
      id: '0x1',
      token: 'ETH',
      label: 'Ethereum',
      rpcUrl: 'https://mainnet.infura.io/v3/${infuraKey}',
    },
    {
      id: '0x4',
      token: 'rETH',
      label: 'Rinkeby',
      rpcUrl: 'https://rinkeby.infura.io/v3/${infuraKey}',
    },
    {
      id: '0xa4b1',
      token: 'ETH',
      label: 'Arbitrum',
      rpcUrl: 'https://arbitrum-one.publicnode.com',
    },
    {
      id: '0x66eed',
      token: 'ETH',
      label: 'Arbitrum Goerli',
      rpcUrl: 'https://arbitrum-goerli.publicnode.com/',
    },
  ],
});

export const useContract = () => {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
  const [contract, setContract] = useState(null);
  const [userBounties, setUserBounties] = useState([]);
  const [userClaims, setUserClaims] = useState([]);
  const [userBalance, setUserBalance] = useState(0);
  const [userSummary, setUserSummary] = useState({});
  const [userNftCards, setUserNftCards] = useState([]);

  const jsonProviderUrl = PROVIDER_URL; // Replace with the desired JSON provider URL

  const [{ settingChain, connectedChain }, setChain] = useSetChain();
  const [setChainAttempts, setSetChainAttempts] = useState(false);
  const [unClaimedBounties, setUnClaimedBounties] = useState([]);
  const [claimedBounties, setClaimedBounties] = useState([]);
  const [userChainId, setUserChainId] = useState("");

  useEffect(() => {
    if (wallet?.provider) {
      if (!settingChain && !setChainAttempts) {
        setChain({
          chainId:
            process.env.REACT_APP_NODE_ENV === 'development'
              ? '0x66eed'
              : '0xa4b1',
        }).catch(error => {
          console.error('Error setting chain:', error);
        });

        setSetChainAttempts(true);
      }
    }
  }, [wallet, settingChain]);

  useEffect(() => {
    const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
    const contractAddress = CONTRACT;
    const contract = new ethers.Contract(contractAddress, abi, provider);
    setContract(contract);
  }, []);

  const getReadOnlyContract = async () => {
    const provider = new ethers.JsonRpcProvider(jsonProviderUrl);
    const contractAddress = CONTRACT;
    return new ethers.Contract(contractAddress, abi, provider);
  };

  const getConnectedContract = async () => {
    if (!wallet || !contract || !isCorrectChain()) return null;
    const ethersProvider = new ethers.BrowserProvider(wallet.provider);
    return contract.connect(await ethersProvider.getSigner());
  };

  const getNftContract = async () => {
    //if (!wallet || !contract || !isCorrectChain()) return null;
    const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
    const contractAddress = CONTRACT;
    return new ethers.Contract(contractAddress, abiErc721Enumerable1, provider);
  };

  const fetchAllUserNftTokenIds = async (userAddress, nftContract) => {

    try {

      const balance = Number(await nftContract.balanceOf(userAddress));
      const tokenIds = [];

      for (let i = 0; i < balance; i++) {
        const tokenId = Number(await nftContract.tokenOfOwnerByIndex(userAddress, i));
        tokenIds.push(tokenId);
      }

      return tokenIds

    } catch (error) {
      console.error('Error fetching user nfts:', error);
    }
  };

  const createNftCards = async (userAddress) => {
    try {

      let nftContract = await getNftContract();
      const tokenIds = (await fetchAllUserNftTokenIds(userAddress, nftContract));

      let userNftSummary = [];

      let nftSummary = {};

      for (let i = 0; i < claimedBounties.length; i++) {
        let claims = await getClaimsByBountyId(claimedBounties[i].id);
        //grab claims where token id matches an nft from the address. 
        let filteredClaim = claims.filter(claim => tokenIds.includes(claim.tokenId));
        if (filteredClaim.length > 0) {

          nftSummary = {
            id: null,
            issuer: filteredClaim[0].issuer,
            bountyId: filteredClaim[0].bountyId,
            bountyIssuer: null,
            name: filteredClaim[0].name,
            description: filteredClaim[0].description,
            tokenId: filteredClaim[0].tokenId,
            createdAt: filteredClaim[0].createdAt,
            issuerMyBountyUrl: `${filteredClaim[0].issuer}`,
            openSeaUrl: `https://opensea.io/assets/arbitrum/${CONTRACT}/${filteredClaim[0].tokenId}`
          };

          userNftSummary.push(nftSummary);
        }

      }

      setUserNftCards(userNftSummary);

    } catch (error) {
      console.error('Error creating nft cards:', error);
    }
  };

  const fetchUserBalance = async () => {
    if (wallet?.provider) {
      try {
        const provider = new ethers.BrowserProvider(wallet.provider);
        const balance = await provider.getBalance(wallet.accounts[0].address);
        setUserBalance(balance);
      } catch (error) {
        console.error('Error fetching user balance:', error);
      }
    }
  };

  const fetchAllBounties = async () => {
    try {
      let writeContract = await getConnectedContract();
      let connectedContract = writeContract
        ? writeContract
        : await getReadOnlyContract();
      if (connectedContract) {
        const allBountiesLength =
          Number(await connectedContract.getBountiesLength()) - 1;

        if (allBountiesLength >= 0) {
          // Calculate the starting and ending indices to fetch the latest 20 bounties
          const startIndex = 0;
          const endIndex = allBountiesLength;

          const allBounties = await connectedContract.getBounties(
            startIndex,
            endIndex
          );

          const unfilteredBounties = allBounties.map(bounty => ({
            id: Number(bounty.id),
            issuer: bounty.issuer,
            name: bounty.name,
            description: bounty.description,
            amount: Number(ethers.formatEther(bounty.amount)),
            claimer: bounty.claimer,
            claimId: bounty.claimId,
            createdAt: Number(bounty.createdAt),
          }));

          // const bountiesUnclaimed = unfilteredBounties.filter(
          //   bounty => bounty.claimer === ZeroAddress
          // );

          const { bountiesClaimed, bountiesUnclaimed } = unfilteredBounties.reduce((acc, obj) => {
            if (obj.claimer && obj.claimer !== ZeroAddress) {
              acc.bountiesClaimed.push(obj);
            } else {
              acc.bountiesUnclaimed.push(obj);
            }
            return acc;
          }, { bountiesClaimed: [], bountiesUnclaimed: [] });

          setClaimedBounties(bountiesClaimed);
          setUnClaimedBounties(bountiesUnclaimed);

        }
      }
    } catch (error) {
      console.error('Error fetching user bounties:', error);
    }
  };

  const fetchUserBounties = async (userAddress) => {
    try {
      let connectedContract = await getConnectedContract();
      if (!connectedContract) connectedContract = await getReadOnlyContract();
      if (connectedContract) {
        const userBounties = await connectedContract.getBountiesByUser(
          userAddress
        );
        const plainObject = userBounties.map(bounty => ({
          id: Number(bounty.id),
          issuer: bounty.issuer,
          name: bounty.name,
          description: bounty.description,
          amount: Number(ethers.formatEther(bounty.amount)),
          claimer: bounty.claimer,
          claimId: bounty.claimId,
          createdAt: Number(bounty.createdAt),
        }));
        setUserBounties(plainObject);
      }
    } catch (error) {
      console.error('Error fetching user bounties:', error);
    }
  };

  const fetchUserSummary = async (userAddress) => {
    try {
      const userBountiesSum = userBounties.reduce((acc, obj) => {
        if (obj.claimer !== null && obj.claimer !== ZeroAddress) {
          acc.completedBounties += 1;
          acc.ethSpent += obj.amount === null ? 0 : (obj.amount);
        } else if (obj?.amount != null && Number(obj.amount) > 0) {
          acc.inProgressBounties += 1;
          acc.ethInOpenBounties += obj.amount === null ? 0 : (obj.amount);
        }
        return acc;
      }, { completedBounties: 0, inProgressBounties: 0, ethSpent: 0, ethInOpenBounties: 0 });

      const userAcceptedClaimsSum = claimedBounties.reduce((acc, obj) => {
        if (obj.claimer.trim().toLowerCase() == userAddress.trim().toLowerCase()) {
          acc.completedClaims += 1;
          acc.ethMade += obj.amount === null ? 0 : (obj.amount);
        }
        return acc;
      }, { completedClaims: 0, ethMade: 0 });

      const completeSummary = {
        completedBounties: Number(userBountiesSum.completedBounties),
        inProgressBounties: Number(userBountiesSum.inProgressBounties),
        ethSpent: Number(userBountiesSum.ethSpent),
        ethInOpenBounties: Number(userBountiesSum.ethInOpenBounties),
        completedClaims: Number(userAcceptedClaimsSum.completedClaims),
        ethMade: Number(userAcceptedClaimsSum.ethMade)
      };

      setUserSummary(completeSummary);

    } catch (error) {
      console.error('Error fetching user summary data', error);
    }
  }

  const fetchBountyDetails = async id => {
    try {
      let connectedContract = await getConnectedContract();
      if (!connectedContract) connectedContract = await getReadOnlyContract();
      if (connectedContract) {
        const userBounty = await connectedContract.bounties(id);
        const processedBounty = {
          id: Number(userBounty.id),
          issuer: userBounty.issuer,
          name: userBounty.name,
          description: userBounty.description,
          amount: Number(ethers.formatEther(userBounty.amount)),
          claimer: userBounty.claimer,
          claimId: userBounty.claimId,
          createdAt: Number(userBounty.createdAt),
        };
        return processedBounty;
      }
      return null;
    } catch (error) {
      console.error('Error fetching bounty details:', error);
      return null;
    }
  };

  const fetchUserClaims = async () => {
    try {
      let connectedContract = await getConnectedContract();
      if (!connectedContract) connectedContract = await getReadOnlyContract();
      if (connectedContract) {
        const userClaims = await connectedContract.getClaimsByUser(
          wallet.accounts[0].address
        );
        const plainObject = userClaims.map(claim => ({
          id: Number(claim.id),
          issuer: claim.issuer,
          bountyId: Number(claim.bountyId),
          bountyIssuer: claim.bountyIssuer,
          name: claim.name,
          description: claim.description,
          tokenId: Number(claim.tokenId),
          createdAt: Number(claim.createdAt),
        }));
        setUserClaims(plainObject);
      }
    } catch (error) {
      console.error('Error fetching user claims:', error);
    }
  };

  const createBounty = async (name, description, amount) => {
    try {
      const connectedContract = await getConnectedContract();
      if (connectedContract) {
        const tx = await connectedContract.createBounty(name, description, {
          value: ethers.parseEther(amount),
        });
        await tx.wait();
        return "success";
      }
    } catch (error) {
      console.error('Error creating bounty:', error);
      return ("error: ", error.message);
    }
  };

  const createClaim = async (bountyId, name, uri, description) => {
    try {
      const connectedContract = await getConnectedContract();
      if (connectedContract) {
        const tx = await connectedContract.createClaim(
          bountyId,
          name,
          uri,
          description
        );
        await tx.wait();
        return "success";
      }
    } catch (error) {
      console.error('Error creating claim:', error);
      return ("error: ", error.message);
    }
  };

  const cancelBounty = async bountyId => {
    const connectedContract = await getConnectedContract();
    if (connectedContract) {
      const tx = await connectedContract.cancelBounty(bountyId);
      await tx.wait();
    } else {
      throw new Error('Error cancelling bounty');
    }
  };

  const getClaimsByBountyId = async bountyId => {
    try {
      let connectedContract = await getConnectedContract();
      if (!connectedContract) connectedContract = await getReadOnlyContract();
      if (connectedContract) {
        const bountyClaimsArray = await connectedContract.getClaimsByBountyId(
          bountyId
        );
        const processedClaims = bountyClaimsArray.map(claim => ({
          id: Number(claim.id),
          issuer: claim.issuer,
          bountyId: Number(claim.bountyId),
          bountyIssuer: claim.bountyIssuer,
          name: claim.name,
          description: claim.description,
          tokenId: Number(claim.tokenId),
          createdAt: Number(claim.createdAt),
        }));
        return processedClaims;
      }
      return [];
    } catch (error) {
      console.error('Error fetching claims by bounty ID:', error);
      return [];
    }
  };

  const getTokenUri = async tokenId => {
    try {
      let connectedContract = await getConnectedContract();
      if (!connectedContract) connectedContract = await getReadOnlyContract();
      if (connectedContract) {
        const tokenUri = await connectedContract.tokenURI(tokenId);
        return tokenUri;
      }
      return null;
    } catch (error) {
      console.error('Error fetching token URI:', error);
      return null;
    }
  };

  const acceptClaim = async (bountyId, claimId) => {
    const connectedContract = await getConnectedContract();
    if (connectedContract) {
      const tx = await connectedContract.acceptClaim(bountyId, claimId);
      await tx.wait();
    }
  };

  const isCorrectChain = () => {
    return process.env.REACT_APP_NODE_ENV === 'development'
      ? '0x66eed' == connectedChain.id
      : '0xa4b1' == connectedChain.id;
  };

  const getContract = async () => {
    let contract = await getConnectedContract();
    if (contract) {
      contract.isWrite = true;
    } else {
      contract = await getReadOnlyContract();
      contract.isWrite = false;
    }
    return contract;
  };

  useEffect(() => {

    if (connectedChain?.id) {
      setUserChainId(connectedChain?.id.toString());
    }

  }, [connectedChain]);

  return {
    wallet,
    userBounties,
    userClaims,
    connect,
    disconnect,
    connecting,
    fetchUserBounties,
    fetchUserClaims,
    fetchUserBalance,
    userBalance,
    createBounty,
    createClaim,
    getClaimsByBountyId,
    fetchBountyDetails,
    getTokenUri,
    acceptClaim,
    cancelBounty,
    fetchAllBounties,
    getContract,
    claimedBounties,
    unClaimedBounties,
    fetchUserSummary,
    userSummary,
    createNftCards,
    userNftCards,
    userChainId,
  };
};
