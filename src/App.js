import React from 'react'
import { init, useConnectWallet } from '@web3-onboard/react'
import injectedModule from '@web3-onboard/injected-wallets'
 
const injected = injectedModule()
 
const infuraKey = ''
 
// initialize Onboard
init({
 wallets: [injected],
 chains: [
   {
     id: '0x1',
     token: 'ETH',
     label: 'Ethereum',
     rpcUrl: 'https://mainnet.infura.io/v3/${infuraKey}'
   },
   {
     id: '0x4',
     token: 'rETH',
     label: 'Rinkeby',
     rpcUrl: 'https://rinkeby.infura.io/v3/${infuraKey}'
   }
 ]
})
 
function App() {
 const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()
 
 return (
   <div>
     <button
       disabled={connecting}
       onClick={() => (wallet ? disconnect({label: wallet.label}) : connect())}
     >
       {connecting ? 'connecting' : wallet ? 'disconnect' : 'connect'}
     </button>
     <h1>YO YO YO</h1>
   </div>
 )
}
 
export default App
