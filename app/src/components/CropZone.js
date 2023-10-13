import React, { useState } from 'react';
import Cropper from 'react-easy-crop';
import PropTypes from 'prop-types';

function CropZone({ image, onImageCropped }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedImage, setCroppedImage] = useState(null);
  const [croppedPixels, setCroppedPixels] = useState(null);

  const onCropComplete = async (croppedArea, croppedAreaPixels) => {
    setCroppedPixels(croppedAreaPixels);
  };

  const onCropFinish = async () => {
    try {
      const cropped = await getCroppedImg(
        URL.createObjectURL(image),
        croppedPixels,
        rotation
      );
      setCroppedImage(cropped);
      onImageCropped(cropped);
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  };

  return (
    <div className="crop-wrap">
      <div className="crop-inner-wrap">
        <Cropper
          image={URL.createObjectURL(image)}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          objectFit="contain"
          onCropChange={setCrop}
          aspect={1}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          onCropComplete={onCropComplete}
        />
        {croppedImage && <img src={croppedImage} alt="Cropped" />}
        <div className="crop-finish-button claim-popup-buttons">
          <button onClick={onCropFinish}>finish crop</button>
        </div>
      </div>
    </div>
  );
}

CropZone.propTypes = {
  image: PropTypes.instanceOf(File).isRequired,
  onImageCropped: PropTypes.func.isRequired,
};

export const createImage = url =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', error => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

export function getRadianAngle(degreeValue) {
  return (degreeValue * Math.PI) / 180;
}

export function rotateSize(width, height, rotation) {
  const rotRad = getRadianAngle(rotation);

  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
  // Implementation from your provided code

  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  // Calculate bounding box of rotated image
  const rotRad = getRadianAngle(rotation);
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  );
  // Set canvas size to match the bounding box
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // Translate and rotate around canvas center
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);

  // Draw rotated image
  ctx.drawImage(image, 0, 0);
  // Crop to provided pixel crop area
  const croppedCanvas = cropImageToCanvas(canvas, pixelCrop);

  // Return cropped image as a blob
  return new Promise(resolve => {
    croppedCanvas.toBlob(
      blob => {
        resolve(URL.createObjectURL(blob));
      },
      'image/png',
      1
    );
  });
}

function cropImageToCanvas(canvas, pixelCrop) {
  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d');

  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );
  return croppedCanvas;
}

export default CropZone;
