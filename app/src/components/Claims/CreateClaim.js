/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useContract } from '../../web3';
import { SyncLoader } from 'react-spinners';
import Dropzone from './Dropzone';
import { FaX } from 'react-icons/fa6';
import { uploadFile, uploadMetadata, buildMetadata } from '../../api';
import { ToastContainer, toast } from 'react-toastify';

const gateway = 'https://beige-impossible-dragon-883.mypinata.cloud/ipfs/';

function CreateClaim({ onClose, bountyId }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState({ loading: false, processString: '' });
  const [formData, setFormData] = useState({ name: '', description: '' });
  const { createClaim } = useContract();
  const [imageUri, setImageUri] = useState('');
  const [activeTab, setActiveTab] = useState('create');

  const handleUpload = async acceptedFiles => {
    if (acceptedFiles.length === 0) return;
    const fileName = acceptedFiles[0].name;

    setFile(acceptedFiles[0]);
    setFormData({ ...formData, name: fileName });
    toast.info('File upload initiated');
  };

  const handleSubmit = async event => {
    event.preventDefault();

    if (!formData.name || !formData.description) {
      toast.error('Please fill out all fields');
      return;
    }

    if (formData.name.length > 40) {
      toast.error('The name should be a maximum of 40 characters');
      return;
    }

    if (formData.description.length > 300) {
      toast.error('The description should be a maximum of 300 characters');
      return;
    }

    if (!file) {
      toast.error('Please upload a file');
      return;
    }

    setStatus({
      loading: true,
      processString: 'setting up preview of claim NFT...',
    });
    setActiveTab('preview');
    /*
    const res = await uploadFile(file);
    if (!res) {
      toast.error('Error uploading image to IPFS');
      onClose();
      return;
    }
    setImageUri(`${gateway}${res.IpfsHash}`);
    */
  };

  useEffect(() => {
    if (imageUri !== '') {
      (async () => {
        setStatus({ loading: true, processString: 'uploading metadata...' });
        const metadata = buildMetadata(
          imageUri,
          formData.name,
          formData.description
        );
        const resMetadata = await uploadMetadata(metadata);
        if (!resMetadata) {
          toast.error('Error uploading metadata to IPFS');
          onClose();
          return;
        }
        setStatus({ loading: true, processString: 'creating claim...' });
        console.log(formData.description);
        await createClaim(
          Number(bountyId),
          formData.name,
          `${gateway}${resMetadata.IpfsHash}`,
          formData.description
        );
        // Reset fields after submit
        setFormData({ name: '', description: '' });
        setStatus({ loading: false, processString: '' });
        setFile(null);
        toast.info('Claim submitted succesfully');
      })();
    }
  }, [imageUri]);

  return (
    <div className="claim-popup-overlay">
      <ToastContainer />
      <div className="claim-popup">
        {status.loading ? (
          <div className="process-wrap">
            <SyncLoader
              className="upload-loader"
              color="white"
              loading={status.loading}
              size={5}
            />
            <div className="process-string">{status.processString}</div>
          </div>
        ) : (
          <>
            <Dropzone onDrop={handleUpload} />
            <form onSubmit={handleSubmit}>
              <div className="claim-popup-content-wrap">
                <div className="claim-popup-content-wrap">
                  <label className="claim-name" htmlFor="claim-name">
                    name
                  </label>
                  <input
                    className="claim-name-input"
                    type="text"
                    value={formData.name}
                    onChange={event =>
                      setFormData({ ...formData, name: event.target.value })
                    }
                    required
                  />
                </div>

                <div className="claim-popup-content-wrap">
                  <label
                    className="claim-description"
                    htmlFor="claim-description"
                  >
                    description
                  </label>
                  <textarea
                    className="claim-description-input"
                    value={formData.description}
                    onChange={event =>
                      setFormData({
                        ...formData,
                        description: event.target.value,
                      })
                    }
                    required
                  ></textarea>
                </div>

                <div className="claim-popup-buttons">
                  <button type="submit">view preview</button>
                </div>
              </div>
            </form>
          </>
        )}
        <div className="create-claim-menu-wrap">
          <div
            className={`create-claim-tab ${
              activeTab === 'create' ? 'create-claim-active' : ''
            }`}
            onClick={() => setActiveTab('create')}
          >
            create
          </div>

          <div
            className={`create-claim-tab ${
              activeTab === 'preview' ? 'create-claim-active' : ''
            }`}
            onClick={() => setActiveTab('preview')}
          >
            preview
          </div>
          <FaX
            className="create-claim-close"
            color="#F4595B"
            size={20}
            onClick={onClose}
          />
        </div>
      </div>
    </div>
  );
}

CreateClaim.propTypes = {
  onClose: PropTypes.func.isRequired,
  bountyId: PropTypes.string.isRequired,
};

export default CreateClaim;
