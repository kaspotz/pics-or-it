import axios from 'axios'

const apiUrl = 'http://localhost:3000' // Change this to your production URL if needed

export const uploadFile = async (file) => {
  try {
    const formData = new FormData()
    formData.append('image', file)

    const response = await axios.post(`${apiUrl}/uploadFile`, formData)
    return response.data
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const uploadMetadata = async (metadata) => {
  try {
    const response = await axios.post(`${apiUrl}/uploadMetadata`, {
      metadata,
    })
    return response.data
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const uploadMalformedMetadata = async (metadata) => {
  try {
    const response = await axios.post(`${apiUrl}/uploadMetadata`, {
      metadata,
    })
    return response.data
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const buildMetadata = (imageURI, name, description) => {
  const metadata = {
    description: description,
    external_url: 'https://kaspotz.github.io/pics-or-it/',
    image: imageURI,
    name: name,
    attributes: [],
  }

  return metadata
}

export default buildMetadata
