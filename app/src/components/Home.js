import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import AOS from 'aos';
import 'aos/dist/aos.css';

function Home({ wallet, connect, disconnect, connecting }) {

  const handleCreateBounty = () => {
    console.log('create bounty')
  };

  useEffect(() => {
    AOS.refresh();
  }, [wallet]);

  return (
    <div>
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
            get your bounty in front of people that are interested in completing it
          </p>
          <h3>step 3 - approve a claim 🤝</h3>
          <p>
            monitor for submissions and, when your bounty is completed, release funds
            by claiming a proof-of-work NFT
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
                <input type="text" name="customer_name" required />
              </label>
            </p>
            <p>
              <label>
                eth
                <input type="text" name="bounty_eth" required />
              </label>
            </p>

            <p>
              <label>
                bounty description
                <textarea
                  className="vertical"
                  name="comments"
                  maxLength="1000"
                ></textarea>
              </label>
            </p>

            <p>
              <button onClick={() => handleCreateBounty()}>create bounty</button>
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
