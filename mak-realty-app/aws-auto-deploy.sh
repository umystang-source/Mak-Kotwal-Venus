#!/bin/bash

###############################################################################
# MAK Realty App - Fully Automated AWS Deployment Script
# This script will create and configure everything needed on AWS
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}"
echo "========================================="
echo "MAK Realty App - AWS Auto Deployment"
echo "========================================="
echo -e "${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed${NC}"
    echo "Please install it from: https://aws.amazon.com/cli/"
    exit 1
fi

# Prompt for AWS configuration
echo -e "${YELLOW}Step 1: AWS Configuration${NC}"
read -p "Enter your AWS Region (e.g., us-east-1): " AWS_REGION
read -p "Enter your AWS Access Key ID: " AWS_ACCESS_KEY
read -s -p "Enter your AWS Secret Access Key: " AWS_SECRET_KEY
echo ""
read -p "Enter a name for your EC2 key pair (e.g., mak-realty-key): " KEY_NAME

# Configure AWS CLI
export AWS_DEFAULT_REGION=$AWS_REGION
export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY
export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_KEY

echo -e "${GREEN}✓ AWS CLI configured${NC}"

# Generate secure passwords and secrets
echo -e "\n${YELLOW}Step 2: Generating secure credentials${NC}"
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
JWT_SECRET=$(openssl rand -base64 48 | tr -d "=+/" | cut -c1-64)
echo -e "${GREEN}✓ Credentials generated${NC}"

# Create EC2 key pair
echo -e "\n${YELLOW}Step 3: Creating SSH key pair${NC}"
if ! aws ec2 describe-key-pairs --key-names "$KEY_NAME" &> /dev/null; then
    aws ec2 create-key-pair --key-name "$KEY_NAME" --query 'KeyMaterial' --output text > "${KEY_NAME}.pem"
    chmod 400 "${KEY_NAME}.pem"
    echo -e "${GREEN}✓ Key pair created: ${KEY_NAME}.pem${NC}"
else
    echo -e "${YELLOW}! Key pair already exists, skipping creation${NC}"
fi

# Create security group
echo -e "\n${YELLOW}Step 4: Creating security group${NC}"
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" --query 'Vpcs[0].VpcId' --output text)
SG_NAME="mak-realty-sg"

# Check if security group exists
SG_ID=$(aws ec2 describe-security-groups --filters "Name=group-name,Values=$SG_NAME" --query 'SecurityGroups[0].GroupId' --output text 2>/dev/null || echo "")

if [ "$SG_ID" == "None" ] || [ -z "$SG_ID" ]; then
    SG_ID=$(aws ec2 create-security-group \
        --group-name "$SG_NAME" \
        --description "Security group for MAK Realty App" \
        --vpc-id "$VPC_ID" \
        --query 'GroupId' \
        --output text)

    # Add inbound rules
    aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --protocol tcp --port 22 --cidr 0.0.0.0/0
    aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --protocol tcp --port 80 --cidr 0.0.0.0/0
    aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --protocol tcp --port 443 --cidr 0.0.0.0/0
    aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --protocol tcp --port 5000 --cidr 0.0.0.0/0

    echo -e "${GREEN}✓ Security group created: $SG_ID${NC}"
else
    echo -e "${YELLOW}! Security group already exists: $SG_ID${NC}"
fi

# Get latest Ubuntu AMI
echo -e "\n${YELLOW}Step 5: Finding Ubuntu AMI${NC}"
AMI_ID=$(aws ec2 describe-images \
    --owners 099720109477 \
    --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*" \
    --query 'sort_by(Images, &CreationDate)[-1].ImageId' \
    --output text)
echo -e "${GREEN}✓ Using AMI: $AMI_ID${NC}"

# Launch EC2 instance
echo -e "\n${YELLOW}Step 6: Launching EC2 instance (t3.small)${NC}"
INSTANCE_ID=$(aws ec2 run-instances \
    --image-id "$AMI_ID" \
    --instance-type t3.small \
    --key-name "$KEY_NAME" \
    --security-group-ids "$SG_ID" \
    --block-device-mappings 'DeviceName=/dev/sda1,Ebs={VolumeSize=20,VolumeType=gp3}' \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=mak-realty-app}]' \
    --query 'Instances[0].InstanceId' \
    --output text)

echo -e "${GREEN}✓ Instance launched: $INSTANCE_ID${NC}"
echo -e "${YELLOW}Waiting for instance to start...${NC}"

aws ec2 wait instance-running --instance-ids "$INSTANCE_ID"

# Get public IP
PUBLIC_IP=$(aws ec2 describe-instances \
    --instance-ids "$INSTANCE_ID" \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text)

echo -e "${GREEN}✓ Instance is running at: $PUBLIC_IP${NC}"

# Wait for SSH to be ready
echo -e "\n${YELLOW}Step 7: Waiting for SSH to be ready (this may take 2-3 minutes)${NC}"
sleep 60

MAX_RETRIES=30
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if ssh -i "${KEY_NAME}.pem" -o StrictHostKeyChecking=no -o ConnectTimeout=5 ubuntu@$PUBLIC_IP "echo 'SSH Ready'" &> /dev/null; then
        echo -e "${GREEN}✓ SSH is ready${NC}"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT+1))
    echo -n "."
    sleep 10
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${RED}Error: Could not connect to instance via SSH${NC}"
    exit 1
fi

# Create .env.production file
echo -e "\n${YELLOW}Step 8: Creating environment configuration${NC}"
cat > .env.production << EOF
# Database Configuration
DATABASE_URL=postgresql://mak_user:${DB_PASSWORD}@postgres:5432/mak_realty
POSTGRES_USER=mak_user
POSTGRES_PASSWORD=${DB_PASSWORD}
POSTGRES_DB=mak_realty

# JWT Secret
JWT_SECRET=${JWT_SECRET}

# Application URLs
FRONTEND_URL=http://${PUBLIC_IP}
REACT_APP_API_URL=http://${PUBLIC_IP}:5000

# Server Configuration
NODE_ENV=production
PORT=5000
EOF

echo -e "${GREEN}✓ Environment configuration created${NC}"

# Install Docker on EC2
echo -e "\n${YELLOW}Step 9: Installing Docker on EC2${NC}"
ssh -i "${KEY_NAME}.pem" -o StrictHostKeyChecking=no ubuntu@$PUBLIC_IP << 'ENDSSH'
set -e

# Update system
sudo apt-get update
sudo DEBIAN_FRONTEND=noninteractive apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

echo "Docker installation completed"
ENDSSH

echo -e "${GREEN}✓ Docker installed${NC}"

# Create deployment package
echo -e "\n${YELLOW}Step 10: Creating deployment package${NC}"
tar -czf deploy.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='build' \
  --exclude='uploads' \
  backend frontend docker-compose.yml .env.production

echo -e "${GREEN}✓ Deployment package created${NC}"

# Upload to EC2
echo -e "\n${YELLOW}Step 11: Uploading application to EC2${NC}"
scp -i "${KEY_NAME}.pem" -o StrictHostKeyChecking=no deploy.tar.gz ubuntu@$PUBLIC_IP:/home/ubuntu/
echo -e "${GREEN}✓ Files uploaded${NC}"

# Deploy application
echo -e "\n${YELLOW}Step 12: Deploying application${NC}"
ssh -i "${KEY_NAME}.pem" -o StrictHostKeyChecking=no ubuntu@$PUBLIC_IP << 'ENDSSH'
set -e

# Create app directory
mkdir -p /home/ubuntu/mak-realty-app
cd /home/ubuntu/mak-realty-app

# Extract files
tar -xzf /home/ubuntu/deploy.tar.gz

# Copy environment file
cp .env.production backend/.env

# Build frontend with correct API URL
cd frontend
if [ -f .env ]; then rm .env; fi
echo "REACT_APP_API_URL=$(grep REACT_APP_API_URL ../backend/.env | cut -d '=' -f2)" > .env
cd ..

# Build and start containers
docker-compose build
docker-compose up -d

# Wait for services
sleep 15

# Check status
docker-compose ps

echo "Application deployment completed!"
ENDSSH

echo -e "${GREEN}✓ Application deployed${NC}"

# Cleanup
rm deploy.tar.gz

# Save deployment info
echo -e "\n${YELLOW}Step 13: Saving deployment information${NC}"
cat > deployment-info.txt << EOF
========================================
MAK Realty App - Deployment Information
========================================

Instance ID: $INSTANCE_ID
Public IP: $PUBLIC_IP
Region: $AWS_REGION
Security Group: $SG_ID
SSH Key: ${KEY_NAME}.pem

Application URLs:
- Frontend: http://${PUBLIC_IP}
- Backend API: http://${PUBLIC_IP}:5000

Database Credentials:
- User: mak_user
- Password: ${DB_PASSWORD}
- Database: mak_realty

JWT Secret: ${JWT_SECRET}

SSH Connection:
ssh -i ${KEY_NAME}.pem ubuntu@${PUBLIC_IP}

Docker Commands (run on server):
- View logs: docker-compose logs -f
- Restart: docker-compose restart
- Stop: docker-compose down
- Start: docker-compose up -d

Next Steps:
1. Open http://${PUBLIC_IP} in your browser
2. Register your admin account
3. (Optional) Set up domain name
4. (Optional) Configure SSL certificate

========================================
EOF

echo -e "${GREEN}✓ Deployment info saved to deployment-info.txt${NC}"

# Final summary
echo -e "\n${GREEN}"
echo "========================================="
echo "         DEPLOYMENT COMPLETED!          "
echo "========================================="
echo -e "${NC}"
echo -e "Your application is running at:"
echo -e "${GREEN}http://${PUBLIC_IP}${NC}"
echo ""
echo -e "SSH access:"
echo -e "${YELLOW}ssh -i ${KEY_NAME}.pem ubuntu@${PUBLIC_IP}${NC}"
echo ""
echo -e "All deployment details saved to: ${GREEN}deployment-info.txt${NC}"
echo ""
echo -e "${YELLOW}IMPORTANT: Save the following files securely:${NC}"
echo -e "  - ${KEY_NAME}.pem (SSH key)"
echo -e "  - deployment-info.txt (credentials and URLs)"
echo -e "  - .env.production (environment config)"
echo ""
echo -e "${GREEN}Happy deploying! 🚀${NC}"
