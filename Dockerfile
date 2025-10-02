# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.13.1

# --- Build Stage ---
FROM node:${NODE_VERSION}-slim AS builder
WORKDIR /app

# Upgrade npm
RUN npm install -g npm@11.6.0

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile

# Copy source code
COPY . .

# Build static files
RUN npm run build

# --- Production Stage ---
FROM nginx:alpine AS production

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built app from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config (create this file)
COPY nginx.conf /etc/nginx/nginx.conf

# Expose correct port (nginx default is 80)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]