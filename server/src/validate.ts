import Ajv from 'ajv'

const ajv = new Ajv()

const metadataSchema = {
  type: 'object',
  properties: {
    description: { type: 'string' },
    external_url: { type: 'string' },
    image: { type: 'string' },
    name: { type: 'string' },
    attributes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          trait_type: { type: 'string' },
          value: { type: 'string' },
        },
        required: ['trait_type', 'value'],
      },
    },
  },
  required: ['description', 'external_url', 'image', 'name', 'attributes'],
}

export const validateMetadata = ajv.compile(metadataSchema)
