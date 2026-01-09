#!/bin/bash

# EC2 Initial Setup Script for MAK Realty App
# Run this script on a fresh Ubuntu 22.04 EC2 instance
# Usage: ssh -i your-key.pem ubuntu@YOUR_EC2_IP 'bash -s' < ec2-setup.sh

set -e

echo "========================================="
echo "EC2 Initial Setup for MAK Realty App"
echo "========================================="

# Update system
echo "Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
echo "Installing Docker..."
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
echo "Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add ubuntu user to docker group
echo "Configuring Docker permissions..."
sudo usermod -aG docker ubuntu

# Enable Docker to start on boot
sudo systemctl enable docker
sudo systemctl start docker

# Create app directory
mkdir -p ~/mak-realty-app

# Install useful tools
echo "Installing additional tools..."
sudo apt-get install -y htop curl wget unzip

# Configure firewall (if UFW is enabled)
echo "Configuring firewall..."
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS (for future SSL)
sudo ufw --force enable || true

# Display Docker versions
echo ""
echo "========================================="
echo "Setup Complete!"
echo "========================================="
echo "Docker version: $(docker --version)"
echo "Docker Compose version: $(docker-compose --version)"
echo ""
echo "IMPORTANT: Log out and log back in for Docker group changes to take effect"
echo "Then run: ./deploy-aws.sh to deploy the application"
echo "========================================="
