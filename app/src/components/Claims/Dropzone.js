import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
import { ToastContainer, toast } from 'react-toastify';

function Dropzone({ onDrop }) {
  const [fileDropped, setFileDropped] = useState(false);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: acceptedFiles => {
      // one file only
      const file = acceptedFiles[0];

      const fileSizeInKb = file.size / 1024;
      if (fileSizeInKb > 1000) {
        toast.error('File size must be less than 1MB.');
        return;
      }

      const reader = new FileReader();

      // FileReader read as url, returns a base64 encoded version of the image
      reader.readAsDataURL(file);

      reader.onload = () => {
        // Create new Image object
        const img = new Image();

        img.src = reader.result;

        img.onload = () => {
          const { naturalWidth: width, naturalHeight: height } = img;

          if (width < 300 || height < 300) {
            toast.error(
              'Image dimensions must be at least 300px by 300px. Please upload a larger image.'
            );
            onDrop(acceptedFiles);
            setFileDropped(true);
            return;
          }

          if (width !== height) {
            toast.error(
              'Image must be a square. Resize here: squareanimage.com',
              {
                autoClose: 10000,
              }
            );
            return;
          } else {
            onDrop(acceptedFiles);
            setFileDropped(true);
          }
        };
      };
    },
    maxFiles: 1,
  });

  return (
    <div {...getRootProps()} className="dropzone">
      <ToastContainer />
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the files here ...</p>
      ) : (
        <p>Drag and drop an image file here, or click to select a file</p>
      )}
      {fileDropped && <p>File uploaded!</p>}
    </div>
  );
}

Dropzone.propTypes = {
  onDrop: PropTypes.func.isRequired,
};

export default Dropzone;
