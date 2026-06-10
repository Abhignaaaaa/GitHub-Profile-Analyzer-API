FROM node:20-alpine

# Set node environment
ENV NODE_ENV=production

WORKDIR /app

# Copy package requirements
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy application source code
COPY . .

# Expose port
EXPOSE 5000

# Start command
CMD ["npm", "start"]
