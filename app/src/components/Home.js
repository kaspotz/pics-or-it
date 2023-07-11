import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { useContract } from '../web3'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { BeatLoader } from 'react-spinners' //import the spinner

function Home({ wallet, connect, disconnect, connecting }) {
  const { userBalance, createBounty } = useContract()
  const [bountyAmount, setBountyAmount] = useState(0)
  const [bountyName, setBountyName] = useState('')
  const [bountyDescription, setBountyDescription] = useState('')
  const [loading, setLoading] = useState(false) // new state for loading status

  const handleCreateBounty = async () => {
    if (bountyName.length > 20) {
      toast.error('Bounty name should not exceed 20 characters')
      return
    }
    if (bountyDescription.length > 300) {
      toast.error('Bounty description should not exceed 300 characters')
      return
    }
    if (isNaN(bountyAmount) || bountyAmount <= 0) {
      toast.error('Bounty amount should be a number greater than 0')
      return
    }
    console.log(userBalance)
    if (parseFloat(bountyAmount) > parseFloat(userBalance)) {
      toast.error('Bounty amount should not exceed your balance')
      return
    }

    setLoading(true)
    await createBounty(bountyName, bountyDescription, bountyAmount)
    setLoading(false)

    toast.success('Bounty created successfully')
  }

  useEffect(() => {
    AOS.refresh()
  }, [wallet])

  return (
    <div>
      <ToastContainer />
      <h1 data-aos="fade-in">pics or it didnt happen</h1>
      <header data-aos="fade-in">
        <h1>📸🧾</h1>
      </header>
      {!wallet ? (
        <div data-aos="fade-in" key="no-wallet">
          <h2>the easiest way to get stuff done</h2>
          <h3>step 1 - fund a bounty 💰</h3>
          <p>
            write a bounty description and deposit funds to incentivize bounty
            completion
          </p>
          <h3>step 2 - share the bounty 🗣️</h3>
          <p>
            get your bounty in front of people that are interested in completing
            it
          </p>
          <h3>step 3 - approve a claim 🤝</h3>
          <p>
            monitor for submissions and, when your bounty is completed, release
            funds by claiming a proof-of-work NFT
          </p>
          <h2>connect your wallet to get started</h2>
          <button
            disabled={connecting}
            onClick={() =>
              wallet ? disconnect({ label: wallet.label }) : connect()
            }
          >
            {connecting ? 'connecting' : wallet ? 'disconnect' : 'connect'}
          </button>
        </div>
      ) : (
        <div data-aos="fade-in" key="wallet" className="form-center">
          <form className="myForm">
            <p>
              <label>
                bounty name
                <input
                  type="text"
                  name="customer_name"
                  required
                  value={bountyName}
                  onChange={(e) => setBountyName(e.target.value)}
                />
              </label>
            </p>
            <p>
              <label>
                Arb
                <input
                  type="text"
                  name="bounty_eth"
                  required
                  value={bountyAmount}
                  onChange={(e) => setBountyAmount(e.target.value)}
                />
              </label>
            </p>

            <p>
              <label>
                bounty description
                <textarea
                  className="vertical"
                  name="comments"
                  maxLength="300"
                  value={bountyDescription}
                  onChange={(e) => setBountyDescription(e.target.value)}
                ></textarea>
              </label>
            </p>

            <p>
              <button
                type="button"
                disabled={loading} // button is disabled when loading
                onClick={async () => await handleCreateBounty()}
              >
                {loading ? (
                  <BeatLoader color="white" loading={loading} size={7} />
                ) : (
                  'Create bounty'
                )}
              </button>
            </p>
          </form>
        </div>
      )}
    </div>
  )
}

Home.propTypes = {
  wallet: PropTypes.object,
  connect: PropTypes.func.isRequired,
  disconnect: PropTypes.func.isRequired,
  connecting: PropTypes.bool.isRequired,
}

export default Home
