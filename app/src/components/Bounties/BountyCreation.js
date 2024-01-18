import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BeatLoader } from 'react-spinners';
import { useContract } from '../../web3';
import { FaX } from 'react-icons/fa6';

function BountyCreation({ userBalance, handleClose, wallet, fetchUserBounties, userBounties, userChainId }) {
  const { createBounty } = useContract();
  const [bountyAmount, setBountyAmount] = useState(0);
  const [bountyName, setBountyName] = useState('');
  const [bountyDescription, setBountyDescription] = useState('');
  const [loading, setLoading] = useState(false);

  //when loading is true, try and find the new bounty (with retries). 
  //if found, say success in toast. 
  useEffect(() => {
    let attemptCount = 0;

    const findCreatedBounty = async (address) => {
      await fetchUserBounties(address);
    };

    const callFindCreatedBounty = (address) => {
      if (attemptCount < 6) {
        findCreatedBounty(address);
        if (userBounties.some(bounty => bounty.name.toLowerCase() == bountyName.toLowerCase())) {
          toast.success('Bounty created successfully');
          // reset state attributes
          setBountyAmount(0);
          setBountyName('');
          setBountyDescription('');
        }
        attemptCount++;
        setTimeout(() => callFindCreatedBounty(address), 5000);
      } else {
        toast.error('Time out fault. Unsure if bounty created. Check your /MyBounties page to see if successful.');
      }
    };

    if (loading) {
      callFindCreatedBounty(wallet.accounts[0].address);
    }

    setLoading(false);
  }, [loading]);

  const handleCreateBounty = async () => {

    if (userChainId != "0xa4b1") {
      toast.error('Must be connected to Arbitrum chain');
      return;
    }

    if (bountyName.length > 40) {
      toast.error('Bounty name should not exceed 40 characters');
      return;
    }
    if (bountyDescription.length > 300) {
      toast.error('Bounty description should not exceed 300 characters');
      return;
    }
    if (isNaN(bountyAmount) || bountyAmount <= 0) {
      toast.error('Bounty amount should be a number greater than 0');
      return;
    }
    if (parseFloat(bountyAmount) > parseFloat(userBalance)) {
      toast.error('Bounty amount should not exceed your balance');
      return;
    }

    let result = await createBounty(bountyName, bountyDescription, bountyAmount);
    console.log("result", result);

    if (!result.toLowerCase().includes("success")) {
      toast.error(result.slice(0, 100));
    } else {
      loading(true);
    }

  };

  return (
    <div className="bounty-creation-inner-wrap form-center">
      <ToastContainer />
      <form className="myForm">
        <p>
          <label>
            bounty name
            <input
              type="text"
              name="customer_name"
              maxLength="40"
              required
              value={bountyName}
              onChange={e => setBountyName(e.target.value)}
            />
          </label>
        </p>
        <p>
          <label>
            eth
            <input
              type="text"
              name="bounty_eth"
              required
              value={bountyAmount}
              onChange={e => setBountyAmount(e.target.value)}
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
              onChange={e => setBountyDescription(e.target.value)}
            ></textarea>
          </label>
        </p>

        <p>
          <button
            type="button"
            disabled={loading}
            onClick={async () => await handleCreateBounty()}
          >
            {loading ? (
              <BeatLoader color="white" loading={loading} size={7} />
            ) : (
              'create bounty'
            )}
          </button>
        </p>
      </form>
      <FaX
        className="create-bounty-close"
        color="#F4595B"
        size={20}
        onClick={handleClose}
      />
    </div>
  );
}

BountyCreation.propTypes = {
  userBalance: PropTypes.string,
  handleClose: PropTypes.func.isRequired,
  fetchUserBounties: PropTypes.func.isRequired,
  userBounties: PropTypes.array.isRequired,
  wallet: PropTypes.object,
  userChainId: PropTypes.string,
};

export default BountyCreation;
