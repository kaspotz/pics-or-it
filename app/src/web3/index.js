import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { init, useConnectWallet } from '@web3-onboard/react'
import injectedModule from '@web3-onboard/injected-wallets'
import { abi } from './abi.js'
import { ARB_RPC, ARB_DEV_RPC, CONTRACT_DEV_ADDRESS } from './constants.js'

const injected = injectedModule()

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
})

export const useContract = () => {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()

  const [contract, setContract] = useState(null)
  const [userBounties, setUserBounties] = useState([])
  const [userClaims, setUserClaims] = useState([])
  const [userBalance, setUserBalance] = useState(0)

  useEffect(() => {
    const provider = new ethers.JsonRpcProvider(ARB_DEV_RPC)
    const contractAddress = CONTRACT_DEV_ADDRESS
    const contract = new ethers.Contract(contractAddress, abi, provider)
    setContract(contract)
  }, [])

  const getConnectedContract = async () => {
    if (!wallet || !contract) return null
    const ethersProvider = new ethers.BrowserProvider(wallet.provider)
    return contract.connect(await ethersProvider.getSigner())
  }

  const fetchUserBalance = async () => {
    if (wallet) {
      const provider = new ethers.BrowserProvider(wallet.provider)
      const balance = await provider.getBalance(wallet.accounts[0].address)
      setUserBalance(balance)
    }
  }

  const fetchUserBounties = async () => {
    const connectedContract = await getConnectedContract()
    if (connectedContract) {
      const userBounties = await connectedContract.getBountiesByUser(
        wallet.accounts[0].address,
      )
      const plainObject = userBounties.map((bounty) => {
        return {
          id: Number(bounty.id), // converted from BigInt to Number
          issuer: bounty.issuer, // address remains a string
          name: bounty.name, // string
          description: bounty.description, // string
          amount: Number(ethers.formatEther(bounty.amount)), // converted from BigInt to Number
          claimer: bounty.claimer, // address remains a string
          claimUri: bounty.claimUri, // string
          createdAt: Number(bounty.createdAt), // converted from BigInt to Number
        }
      })
      setUserBounties(plainObject)
    }
  }

  const fetchUserClaims = async () => {
    const connectedContract = await getConnectedContract()
    if (connectedContract) {
      const userClaims = await connectedContract.getClaimsByUser(
        wallet.accounts[0].address,
      )
      const plainObject = userClaims.map((claim) => {
        return {
          id: Number(claim.id), // converted from BigInt to Number
          issuer: claim.issuer, // address remains a string
          bountyId: Number(claim.bountyId), // converted from BigInt to Number
          bountyIssuer: claim.bountyIssuer, // address remains a string
          name: claim.name, // string
          tokenId: Number(claim.tokenId), // converted from BigInt to Number
          createdAt: Number(claim.createdAt), // converted from BigInt to Number
        }
      })
      setUserClaims(plainObject)
    }
  }

  const createBounty = async (name, description, amount) => {
    const connectedContract = await getConnectedContract()
    if (connectedContract) {
      const tx = await connectedContract.createBounty(name, description, {
        value: ethers.parseEther(amount),
      })
      await tx.wait()
    }
  }

  const createClaim = async (bountyId, name, uri) => {
    const connectedContract = await getConnectedContract()
    if (connectedContract) {
      const tx = await connectedContract.createClaim(bountyId, name, uri)
      await tx.wait()
    }
  }

  useEffect(() => {
    if (wallet) {
      fetchUserBounties()
      fetchUserClaims()
      fetchUserBalance()
    }
  }, [wallet])

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
  }
}
