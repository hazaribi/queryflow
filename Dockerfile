FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN cd backend && npm ci --only=production
RUN cd frontend && npm ci && npm run build

# Copy source code
COPY backend/ ./backend/
COPY frontend/dist/ ./frontend/dist/

# Create data directory
RUN mkdir -p backend/data

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "backend/server.js"]