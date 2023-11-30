import axios from 'axios';

// eslint-disable-next-line no-unused-vars
const apiUrl =
  process.env.REACT_APP_NODE_ENV === 'development'
    ? 'http://localhost:3001'
    : 'https://us-central1-plated-hangout-393021.cloudfunctions.net/poidh';

export const uploadFile = async file => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await axios.post(`${apiUrl}/uploadFile`, formData);
    return response.data;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

export const uploadMetadata = async metadata => {
  try {
    const response = await axios.post(`${apiUrl}/uploadMetadata`, {
      metadata,
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const buildMetadata = (imageURI, name, description) => {
  const metadata = {
    description: description,
    external_url: 'https://kaspotz.github.io/pics-or-it/',
    image: imageURI,
    name: name,
    attributes: [],
  };

  return metadata;
};

export default buildMetadata;
