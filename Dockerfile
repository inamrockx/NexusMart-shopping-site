# Stage 1: Build the React frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Set up the production Node.js Express server
FROM node:18-alpine
WORKDIR /app

# Copy server package files and install production dependencies
COPY server/package*.json ./server/
RUN cd server && npm install --only=production

# Copy server source code
COPY server/ ./server/

# Copy the compiled static assets from the frontend build stage
COPY --from=frontend-builder /app/client/dist ./client/dist

# Expose the single port that Hugging Face Spaces requires (7860)
ENV PORT=7860
EXPOSE 7860

# Run the Express server
WORKDIR /app/server
CMD ["npm", "start"]
