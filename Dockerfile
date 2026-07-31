# Use an official Node.js runtime as a parent image.
# Using a long-term support (LTS) version is recommended.
FROM node:22-slim

# Set the working directory in the container.
WORKDIR /usr/src/app

# Copy the backend's package files first to leverage Docker layer caching.
COPY backend/package*.json ./

# Install application dependencies.
RUN npm install --only=production

# Copy the rest of your application's source code.
# The backend folder will be copied into the current directory.
COPY . .

# The service in the container will listen on the port defined by the
# PORT environment variable. Cloud Run automatically provides this.
EXPOSE 8080

# Define the command to run your app from the backend sub-directory.
CMD [ "node", "backend/server.js" ]