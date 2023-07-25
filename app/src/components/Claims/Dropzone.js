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
      if (fileSizeInKb > 500) {
        toast.error('File size must be less than 300kb.');
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

          if (width !== height) {
            toast.error(
              "Uploaded dimensions aren't equal (width !== height). Image must be a square."
            );
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
