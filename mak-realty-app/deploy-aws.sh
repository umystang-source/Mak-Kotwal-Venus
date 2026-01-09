#!/bin/bash

# AWS Deployment Script for MAK Realty App
# This script deploys the application to an EC2 instance

set -e

echo "========================================="
echo "MAK Realty App - AWS Deployment Script"
echo "========================================="

# Configuration - Update these values
EC2_USER="ubuntu"
EC2_HOST="${EC2_HOST:-YOUR_EC2_PUBLIC_IP}"
KEY_PATH="${SSH_KEY_PATH:-~/.ssh/your-key.pem}"
APP_DIR="/home/ubuntu/mak-realty-app"

if [ "$EC2_HOST" == "YOUR_EC2_PUBLIC_IP" ]; then
  echo "ERROR: Please set EC2_HOST environment variable"
  echo "Usage: EC2_HOST=1.2.3.4 SSH_KEY_PATH=~/.ssh/key.pem ./deploy-aws.sh"
  exit 1
fi

echo "Connecting to EC2 instance: $EC2_HOST"

# Create deployment package
echo "Creating deployment package..."
tar -czf deploy.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='build' \
  --exclude='uploads/*' \
  --exclude='*.tar.gz' \
  backend frontend docker-compose.prod.yml .env.production

# Upload to EC2
echo "Uploading files to EC2..."
scp -i "$KEY_PATH" deploy.tar.gz "$EC2_USER@$EC2_HOST:/tmp/"

# Deploy on EC2
echo "Deploying on EC2..."
ssh -i "$KEY_PATH" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
  set -e

  # Create app directory
  mkdir -p ~/mak-realty-app
  cd ~/mak-realty-app

  # Extract files
  tar -xzf /tmp/deploy.tar.gz
  rm /tmp/deploy.tar.gz

  # Rename docker-compose file
  mv docker-compose.prod.yml docker-compose.yml

  # Stop existing containers
  docker-compose down || true

  # Build and start containers
  docker-compose build --no-cache
  docker-compose up -d

  # Wait for services to start
  echo "Waiting for services to start..."
  sleep 15

  # Check container status
  docker-compose ps

  # Check if backend is healthy
  echo "Checking application health..."
  curl -s http://localhost/api/health || echo "Health check failed - please verify manually"

  echo ""
  echo "========================================="
  echo "Deployment completed!"
  PUBLIC_IP=$(curl -s ifconfig.me)
  echo "Application URL: http://$PUBLIC_IP"
  echo "========================================="
ENDSSH

# Cleanup
rm deploy.tar.gz

echo ""
echo "Deployment completed successfully!"
echo "Don't forget to update .env.production with your EC2 public IP before deploying!"
