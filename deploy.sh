#!/bin/bash
set -e

CONTAINER_NAME=byteme-admin
IMAGE=ghcr.io/devbyteme/byteme-admin_portal:latest

echo "Stopping old container (if running)..."
docker stop $CONTAINER_NAME || true
docker rm $CONTAINER_NAME || true

echo "Pulling latest image..."
docker pull $IMAGE

echo "Starting new container..."

docker run -d --name $CONTAINER_NAME -p 4173:4173 $IMAGE

echo "Deployment successful!"
