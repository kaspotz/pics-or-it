import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BeatLoader } from 'react-spinners';
import { useContract } from '../../web3';
import { FaX } from 'react-icons/fa6';

function BountyCreation({ userBalance, handleClose }) {
  const { createBounty } = useContract();
  const [bountyAmount, setBountyAmount] = useState(0);
  const [bountyName, setBountyName] = useState('');
  const [bountyDescription, setBountyDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateBounty = async () => {
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

    setLoading(true);
    await createBounty(bountyName, bountyDescription, bountyAmount);
    setLoading(false);

    toast.success('Bounty created successfully');
    // reset state attributes
    setBountyAmount(0);
    setBountyName('');
    setBountyDescription('');
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
};

export default BountyCreation;
