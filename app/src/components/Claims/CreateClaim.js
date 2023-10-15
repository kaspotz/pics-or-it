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
import { createImage } from '../CropZone';

const gateway = 'https://beige-impossible-dragon-883.mypinata.cloud/ipfs/';

function CreateClaim({ onClose, bountyId }) {
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
    setFormData({ ...formData, name: fileName });
    if (showSubmit) setShowSubmit(true);
  };

  async function fetchBlobFromUrl(blobUrl) {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    return blob;
  }

  const handleSubmit = async croppedImage => {
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

    if (image.size > 500000) {
      setStatus({
        loading: true,
        processString: 'compressing image...',
      });
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      try {
        compressedFile = await imageCompression(image, options);
      } catch (error) {
        toast.error('error compressing file: ', error);
      }
    }
    setStatus({
      loading: true,
      processString: 'uploading image to IPFS...',
    });

    try {
      const res = await uploadFile(compressedFile ? compressedFile : image);
      if (!res) {
        toast.error('Error uploading image to IPFS');
        onClose();
        return;
      }
      setImageUri(`${gateway}${res.IpfsHash}`);
    } catch (error) {
      toast.error('Error uploading image to IPFS: ', error);
      onClose();
      return;
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
        if (!resMetadata) {
          toast.error('Error uploading metadata to IPFS');
          onClose();
          return;
        }
        setStatus({ loading: true, processString: 'creating claim...' });
        await createClaim(
          bountyId,
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
        ) : activeTab === 'preview' ? (
          <PreviewClaim
            file={file}
            name={formData.name}
            description={formData.description}
            showSubmit={showSubmit}
            handleSubmit={handleSubmit}
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
            onClick={() => attemptNavigatePreview('preview')}
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
  bountyId: PropTypes.number.isRequired,
};

export default CreateClaim;
