import chai from 'chai'
import chaiHttp from 'chai-http'
import fs from 'fs'
import path from 'path'

chai.use(chaiHttp)
const { expect } = chai

const app = 'http://localhost:3000' // Change this to your production URL if needed

/** test metadata */
const correctMetadata = {
  description: 'A beautiful picture of a landscape',
  external_url: 'https://example.com/landscape',
  image: 'https://example.com/images/landscape.png',
  name: 'Landscape',
  attributes: [
    {
      trait_type: 'Type',
      value: 'Landscape',
    },
    {
      trait_type: 'Artist',
      value: 'John Doe',
    },
  ],
}

const malformedMetadata = {
  description: 'A beautiful picture of a landscape',
  image: 'https://example.com/images/landscape.png',
  name: 'Landscape',
  attributes: {
    trait_type: 'Type',
    value: 'Landscape',
  },
}

describe('Test Pinata API', () => {
  it('should upload a file to Pinata', done => {
    chai
      .request(app)
      .post('/uploadFile')
      .attach(
        'image',
        fs.readFileSync(path.join(__dirname, './assets/test.png')),
        './assets/test.png'
      )
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        console.log(res.body)
        done()
      })
  })
  it('should upload correct metadata to Pinata', done => {
    const metadata = {
      description: 'A beautiful picture of a landscape',
      external_url: 'https://example.com/landscape',
      image: 'https://example.com/images/landscape.png',
      name: 'Landscape',
      attributes: [
        {
          trait_type: 'Type',
          value: 'Landscape',
        },
        {
          trait_type: 'Artist',
          value: 'John Doe',
        },
      ],
    }

    chai
      .request(app)
      .post('/uploadMetadata')
      .send({ metadata })
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        done()
      })
  })
  it('should reject malformed metadata', done => {
    const malformedMetadata = {
      description: 'A beautiful picture of a landscape',
      image: 'https://example.com/images/landscape.png',
      name: 'Landscape',
      attributes: {
        trait_type: 'Type',
        value: 'Landscape',
      },
    }

    chai
      .request(app)
      .post('/uploadMetadata')
      .send({ metadata: malformedMetadata })
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(400)
        done()
      })
  })

  /*
    it('should upload metadata to Pinata', (done) => {
        const metadata = { 
            name: 'MyCustomName',
            fileURI,
            customKey: 'customValue',
            customKey2: 'customValue2' 
        };

        chai.request(app)
            .post('/uploadMetadata')
            .send({ metadata })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                done();
            });
    });
    */
})
