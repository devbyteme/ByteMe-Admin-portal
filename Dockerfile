# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.13.1

# --- Build Stage ---
FROM node:${NODE_VERSION}-slim AS builder
WORKDIR /app

# Accept build-time args
ARG VITE_API_BASE_URL
ARG NEXTAUTH_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV NEXTAUTH_URL=$NEXTAUTH_URL

# Upgrade npm
RUN npm install -g npm@11.6.0

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source code
COPY . .

# Build static files (env vars get injected here)
RUN npm run build


# --- Production Stage ---
FROM nginx:alpine AS production

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built app from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 (map to 4173 outside in docker-compose)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
