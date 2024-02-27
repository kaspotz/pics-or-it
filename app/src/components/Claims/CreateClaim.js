/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useContract } from '../../web3';
import { SyncLoader } from 'react-spinners';
import Dropzone from './Dropzone';
import { FaX } from 'react-icons/fa6';
import { uploadMetadata, buildMetadata } from '../../api';
import PreviewClaim from './PreviewClaim';
import { ToastContainer, toast } from 'react-toastify';
import { uploadFile } from '../../api';
import imageCompression from 'browser-image-compression';

const gateway = 'https://beige-impossible-dragon-883.mypinata.cloud/ipfs/';

function CreateClaim({
  onClose,
  bountyId,
  userChainId,
  setBountyRender,
  wallet,
  userBalance,
}) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState({ loading: false, processString: '' });
  const [formData, setFormData] = useState({ name: '', description: '' });
  const { createClaim } = useContract();
  const [imageUri, setImageUri] = useState('');
  const [activeTab, setActiveTab] = useState('create');
  const [showSubmit, setShowSubmit] = useState(false);

  const handleUpload = async (acceptedFiles, showSubmit) => {
    if (acceptedFiles.length === 0) return;
    const fileName = acceptedFiles[0].name;

    setFile(acceptedFiles[0]);
    setFormData({ ...formData });
    if (showSubmit) setShowSubmit(true);
  };

  async function fetchBlobFromUrl(blobUrl) {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    return blob;
  }

  const handleSubmit = async croppedImage => {
    if (userChainId != '0xa4b1') {
      toast.error('Must be on Arbitrum chain. Switch then refresh browser.');
      return;
    }

    if (parseFloat(userBalance) < BigInt(0.00002 * 1e18)) {
      toast.error('User balance too low for gas fee.');
      return;
    }

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

    const blob = await fetchBlobFromUrl(croppedImage);
    let image = new File([blob], formData.name, {
      lastModified: Date.now(),
      type: blob.type,
    });
    setActiveTab('create');

    let compressedFile = null;

    if (image.size > 30720000) {
      setStatus({
        loading: true,
        processString: 'compressing image...',
      });
      const options = {
        maxSizeMB: 30,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      try {
        compressedFile = await imageCompression(image, options);
      } catch (error) {
        toast.error(`error compressing file: ${error}`);
        setStatus({ loading: false });
        return;
      }
    }
    setStatus({
      loading: true,
      processString: 'uploading image to IPFS...',
    });

    // Retry strategy
    const MAX_RETRIES = 6; // Maximum number of retries
    const RETRY_DELAY = 3000; // Delay between retries in milliseconds

    const retryUpload = async file => {
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          const res = await uploadFile(file);
          if (!res) {
            throw new Error('No response from upload service');
          }
          return res; // Upload was successful, return the response
        } catch (error) {
          if (attempt === MAX_RETRIES) {
            throw error; // All attempts failed, throw the error
          }
          console.log(
            `Attempt ${attempt} failed, retrying in ${RETRY_DELAY}ms...`
          );
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
      }
    };

    try {
      const fileToUpload = compressedFile ? compressedFile : image;
      const res = await retryUpload(fileToUpload);
      setImageUri(`${gateway}${res.IpfsHash}`);
    } catch (error) {
      toast.error(`Error uploading image to IPFS: ${error}`);
      onClose();
    } finally {
      setStatus({ loading: false });
    }
  };

  const attemptNavigatePreview = () => {
    if (!formData.name || !formData.description) {
      toast.error('Please fill out all fields');
      return;
    }

    if (!file) {
      toast.error('Please upload a file');
      return;
    }

    setActiveTab('preview');
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
        // if (!resMetadata) {
        //   toast.error('Error uploading metadata to IPFS');
        //   onClose();
        //   return;
        // }
        setStatus({ loading: true, processString: 'creating claim...' });
        let result = await createClaim(
          bountyId,
          formData.name,
          `${gateway}${resMetadata.IpfsHash}`,
          formData.description
        );

        if (!result.toLowerCase().includes('success')) {
          toast.error(result.slice(0, 100));
          onClose();
        } else {
          // Reset fields after submit
          setFormData({ name: '', description: '' });
          setStatus({ loading: false, processString: '' });
          setFile(null);
          toast.success('claim submitted successfully');
          setTimeout(() => {
            onClose();
            setBountyRender(true);
          }, 2000);
        }
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
        ) : activeTab === 'preview' ? (
          <PreviewClaim
            file={file}
            name={formData.name}
            description={formData.description}
            showSubmit={showSubmit}
            handleSubmit={handleSubmit}
            wallet={wallet}
          />
        ) : (
          <>
            <Dropzone onDrop={handleUpload} />
            <form>
              <div className="claim-popup-content-wrap">
                <div className="claim-popup-content-wrap">
                  <label className="claim-name" htmlFor="claim-name">
                    name
                  </label>
                  <input
                    className="claim-name-input"
                    type="text"
                    maxLength="40"
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
                  <button onClick={attemptNavigatePreview}>view preview</button>
                </div>
              </div>
            </form>
          </>
        )}
        <div className="create-claim-menu-wrap">
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
  bountyId: PropTypes.number.isRequired,
  userChainId: PropTypes.string,
  setBountyRender: PropTypes.func,
  wallet: PropTypes.object,
  userBalance: PropTypes.string,
};

export default CreateClaim;
