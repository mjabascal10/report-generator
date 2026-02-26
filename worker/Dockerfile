FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
COPY worker/package.json ./worker/
COPY worker/tsconfig.json ./worker/

# Install dependencies
RUN npm install --workspaces --include=worker

# Copy source code
COPY worker/src ./worker/src

# Build
RUN npm run build --workspace worker

# Start application
CMD ["npm", "start", "--workspace", "worker"]

