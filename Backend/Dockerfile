# Use Node.js base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm install --production

# Copy only necessary app files (excluding dev/test assets)
COPY . .

# Set environment variable for production
ENV NODE_ENV=production

# Expose the app port
EXPOSE 80

# Start the server directly
CMD ["node", "index.js"]
