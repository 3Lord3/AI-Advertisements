FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY . . 

# Expose port
EXPOSE 5173

# Start the app in development mode with hot reload
CMD ["npm", "run", "dev", "--", "--host", "--port", "5173"]
