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
  //const [bounties, setBounties] = useState([])
  const [userBounties, setUserBounties] = useState([])
  const [userClaims, setUserClaims] = useState([])

  useEffect(() => {
    const provider = new ethers.JsonRpcProvider(ARB_DEV_RPC)
    const contractAddress = CONTRACT_DEV_ADDRESS
    const contract = new ethers.Contract(contractAddress, abi, provider)
    setContract(contract)
  }, [])

  /*
  const fetchAllBounties = useCallback(
    async (startIndex = 0, endIndex = 100) => {
      if (contract) {
        try {
          const allBounties = await contract.getBounties(startIndex, endIndex)
          setBounties(allBounties)
        } catch (error) {
          console.error(error)
        }
      }
    },
    [contract],
  )
  */

  const fetchUserBounties = async () => {
    if (contract && wallet) {
      const ethersProvider = new ethers.AbstractProvider(wallet.provider, 'any')
      const signer = contract.connect(ethersProvider.getSigner())
      const userBounties = await signer.getUserBounties(wallet.address)
      setUserBounties(userBounties)
    }
  }

  const fetchUserClaims = async () => {
    if (contract && wallet) {
      const ethersProvider = new ethers.AbstractProvider(wallet.provider, 'any')
      const signer = contract.connect(ethersProvider.getSigner())
      const userClaims = await signer.getUserClaims(wallet.address)
      setUserClaims(userClaims)
    }
  }

  return {
    wallet,
    userBounties,
    userClaims,
    connect,
    disconnect,
    connecting,
    fetchUserBounties,
    fetchUserClaims,
  }
}
