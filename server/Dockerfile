# Use an official Node.js runtime as a parent image
FROM node:16-alpine

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json, package-lock.json, and .env to the working directory
COPY package*.json ./
COPY .env ./

# Install any needed packages specified in package.json
RUN npm install

# Bundle the source code inside the Docker image
COPY . .

# Make port 3000 available to the outside world
EXPOSE 3000

# Run the index.ts file when the Docker container launches
CMD [ "npx", "ts-node", "index.ts" ]
