import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useContract } from '../../web3'
import { SyncLoader } from 'react-spinners'

function CreateClaim({ onClose, bountyId }) {
  const [name, setName] = useState('')
  const [uri] = useState('')
  const [uploading, setUploading] = useState(false)
  const { createClaim } = useContract()
  const [processString, setProcessString] = useState('')

  const handleSubmit = async (event) => {
    if (uploading) return
    if (name == '' || uri == '') return
    event.preventDefault()
    await createClaim(bountyId, name, uri)
    onClose()
  }

  const handleUpload = () => {
    setUploading(true)
    setProcessString('uploading image to IPFS...')
  }

  return (
    <div className="claim-popup-overlay">
      <div className="claim-popup">
        <h2>submit claim</h2>
        {!uploading ? (
          <div className="claim-popup-content-wrap">
            <button type="button" onClick={handleUpload}>
              Upload
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="claim-popup-content-wrap">
              <label className="claim-name" htmlFor="claim-name">
                name
              </label>
              <input
                className="claim-name-input"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>

            <div className="claim-popup-buttons">
              <button type="submit">submit</button>
            </div>
          </form>
        )}
        <div className="process-wrap">
          <div className="upload-wrap">
            <div>
              <SyncLoader
                className="upload-loader"
                color="white"
                loading={uploading}
                size={5}
              />
              {processString}
            </div>
          </div>
        </div>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}

CreateClaim.propTypes = {
  onClose: PropTypes.func.isRequired,
  bountyId: PropTypes.number.isRequired,
}

export default CreateClaim
