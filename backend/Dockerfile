# backend/Dockerfile
# Stage 1: Build dependencies and compile TypeScript
FROM node:18

WORKDIR /app

# Copy package.json and package-lock.json (if exists)
COPY package*.json ./

# Install dependencies with npm
RUN npm install

# Copy the rest of the application code
COPY . .

# Build TypeScript and capture output
RUN npm run build

# Expose port 4000
EXPOSE 4000

# Start the server with Node.js
CMD ["node", "dist/index.js"]