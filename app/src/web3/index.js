import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { init, useConnectWallet } from '@web3-onboard/react';
import injectedModule from '@web3-onboard/injected-wallets';
import { abi } from './abi.js';
import { ARB_RPC, ARB_DEV_RPC, CONTRACT_DEV_ADDRESS } from './constants.js';

const injected = injectedModule();

// initialize Onboard
init({
  wallets: [injected],
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
      rpcUrl: ARB_RPC,
    },
    {
      id: '0x4e9545',
      token: 'ETH',
      label: 'Arbitrum Goerli',
      rpcUrl: ARB_DEV_RPC,
    },
  ],
});

export const useContract = () => {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();

  const [contract, setContract] = useState(null);
  const [userBounties, setUserBounties] = useState([]);
  const [userClaims, setUserClaims] = useState([]);
  const [userBalance, setUserBalance] = useState(0);

  const jsonProviderUrl = ARB_DEV_RPC; // Replace with the desired JSON provider URL

  useEffect(() => {
    const provider = new ethers.JsonRpcProvider(ARB_DEV_RPC);
    const contractAddress = CONTRACT_DEV_ADDRESS;
    const contract = new ethers.Contract(contractAddress, abi, provider);
    setContract(contract);
  }, []);

  const getReadOnlyContract = async () => {
    const provider = new ethers.JsonRpcProvider(jsonProviderUrl);
    const contractAddress = CONTRACT_DEV_ADDRESS;
    return new ethers.Contract(contractAddress, abi, provider);
  };

  const getConnectedContract = async () => {
    if (!wallet || !contract) return null;
    const ethersProvider = new ethers.BrowserProvider(wallet.provider);
    return contract.connect(await ethersProvider.getSigner());
  };

  const fetchUserBalance = async () => {
    if (wallet) {
      try {
        const provider = new ethers.BrowserProvider(wallet.provider);
        const balance = await provider.getBalance(wallet.accounts[0].address);
        setUserBalance(balance);
      } catch (error) {
        console.error('Error fetching user balance:', error);
      }
    }
  };

  const fetchUserBounties = async () => {
    try {
      let connectedContract = await getConnectedContract();
      if (!connectedContract) connectedContract = await getReadOnlyContract();
      if (connectedContract) {
        const userBounties = await connectedContract.getBountiesByUser(
          wallet.accounts[0].address
        );
        const plainObject = userBounties.map(bounty => ({
          id: Number(bounty.id),
          issuer: bounty.issuer,
          name: bounty.name,
          description: bounty.description,
          amount: Number(ethers.formatEther(bounty.amount)),
          claimer: bounty.claimer,
          claimUri: bounty.claimUri,
          createdAt: Number(bounty.createdAt),
        }));
        setUserBounties(plainObject);
      }
    } catch (error) {
      console.error('Error fetching user bounties:', error);
    }
  };

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
          claimUri: userBounty.claimUri,
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
      }
    } catch (error) {
      console.error('Error creating bounty:', error);
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
      }
    } catch (error) {
      console.error('Error creating claim:', error);
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

  useEffect(() => {
    if (wallet) {
      fetchUserBounties();
      fetchUserClaims();
      fetchUserBalance();
    }
  }, [wallet]);

  return {
    wallet,
    userBounties,
    userClaims,
    connect,
    disconnect,
    connecting,
    fetchUserBounties,
    fetchUserClaims,
    userBalance,
    createBounty,
    createClaim,
    getClaimsByBountyId,
    fetchBountyDetails,
    getTokenUri,
  };
};
