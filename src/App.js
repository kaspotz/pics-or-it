import React from 'react'
import { init, useConnectWallet, useWallet } from '@web3-onboard/react'
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
     <h1>pics or it didn't happen</h1>
     <header>
     <h1>📸🧾</h1>
     </header>
     <h2>the easiest way to get stuff done</h2>
     <h3>step 1 - fund a task 💰</h3>
     <p>write a task description and deposit funds to incentivize task completion</p>
     <h3>step 2 - share the task 🗣️</h3>
     <p>get your task in front of people that are interested in completing it</p>
     <h3>step 3 - approve a claim 🤝</h3>
     <p>monitor for submissions and, when your task is completed, release funds by claiming a proof-of-work NFT</p>
     <h2>connect your wallet to get started</h2>
     <button
       disabled={connecting}
       onClick={() => (wallet ? disconnect({label: wallet.label}) : connect())}
     >
       {connecting ? 'connecting' : wallet ? 'disconnect' : 'connect'}
     </button>
     {wallet && (
       <div class="form-center">
         <form class="myForm">
          <p>
          <label>task name
          <input type="text" name="customer_name" required />
          </label> 
          </p>
          <p>
          <label>eth
          <input type="text" name="task_eth" required />
          </label>
          </p>

          <p>
          <label>task description
          <textarea class="vertical" name="comments" maxlength="1000"></textarea>
          </label>
          </p>

          <p><button>create task</button></p>

          </form>
       </div>
     )}
   </div>
 )
}
 
export default App
