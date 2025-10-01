# # syntax=docker/dockerfile:1

# ARG NODE_VERSION=22.13.1

# # --- Build Stage ---
# FROM node:${NODE_VERSION}-slim AS builder
# WORKDIR /app

# # Upgrade npm to avoid version mismatches
# RUN npm install -g npm@11.6.0

# # Install dependencies (less strict than npm ci)
# COPY package.json package-lock.json ./
# RUN npm install --frozen-lockfile

# # Copy the rest of the application source
# COPY . .

# # Build the production static files
# RUN npm run build

# # Remove dev dependencies to reduce image size
# RUN npm prune --production

# # --- Production Stage ---
# FROM node:${NODE_VERSION}-slim AS runtime
# WORKDIR /app

# # Create a non-root user
# RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# # Copy only the built app and production dependencies
# COPY --from=builder /app/dist ./dist
# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/package.json ./

# ENV NODE_ENV=production
# ENV NODE_OPTIONS="--max-old-space-size=4096"

# USER appuser

# # Expose the port Vite preview uses by default
# EXPOSE 4173

# # Use Vite's preview server to serve the built static files
# CMD ["npx", "vite", "preview", "--host", "0.0.0.0"]

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

# Optional: custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

