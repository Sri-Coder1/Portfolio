# Use an official Node.js runtime as a parent image.
# Using a long-term support (LTS) version is recommended.
FROM node:18-slim

# Set the working directory in the container.
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory.
COPY package*.json ./

# Install application dependencies.
RUN npm install --only=production

# Copy the rest of your application's source code.
COPY . .

# The service in the container will listen on the port defined by the
# PORT environment variable. Cloud Run automatically provides this.
EXPOSE 8080

# Define the command to run your app.
CMD [ "node", "server.js" ]