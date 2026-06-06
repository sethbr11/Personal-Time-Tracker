# Stage 1: Build the React frontend
FROM node:26-alpine AS build

WORKDIR /app/client

# Copy client package.json and install dependencies
COPY client/package.json ./
RUN npm install

# Copy the rest of the client app
COPY client ./

# Build the React app
RUN npm run build

# Stage 2: Create the production image
FROM node:26-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copy server package.json and install dependencies
COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm install --production

# Copy the rest of the server app and the built client
COPY server ./server
COPY --from=build /app/client/build ./client/build

# The server will run on port 3001 internally
# The run scripts will map the host port (8501) to this
EXPOSE 3001

# Run the backend server, which will also serve the frontend
CMD ["node", "server/server.js"]