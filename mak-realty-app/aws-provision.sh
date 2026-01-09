#!/bin/bash

# AWS EC2 Provisioning Script for MAK Realty App
# Prerequisites: AWS CLI configured with appropriate credentials
# Usage: ./aws-provision.sh

set -e

echo "========================================="
echo "AWS EC2 Provisioning for MAK Realty App"
echo "========================================="

# Configuration - Update these as needed
AWS_REGION="${AWS_REGION:-us-east-1}"
INSTANCE_TYPE="${INSTANCE_TYPE:-t2.micro}"  # Free tier eligible
KEY_NAME="${KEY_NAME:-mak-realty-key}"
SECURITY_GROUP_NAME="mak-realty-sg"
INSTANCE_NAME="mak-realty-server"

echo "Region: $AWS_REGION"
echo "Instance Type: $INSTANCE_TYPE"

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &>/dev/null; then
  echo "ERROR: AWS CLI is not configured. Please run 'aws configure' first."
  exit 1
fi

# Get default VPC ID
echo "Getting default VPC..."
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" --query 'Vpcs[0].VpcId' --output text --region $AWS_REGION)
echo "VPC ID: $VPC_ID"

# Check if security group exists, create if not
echo "Setting up security group..."
SG_ID=$(aws ec2 describe-security-groups --filters "Name=group-name,Values=$SECURITY_GROUP_NAME" --query 'SecurityGroups[0].GroupId' --output text --region $AWS_REGION 2>/dev/null || echo "None")

if [ "$SG_ID" == "None" ] || [ -z "$SG_ID" ]; then
  echo "Creating security group..."
  SG_ID=$(aws ec2 create-security-group \
    --group-name $SECURITY_GROUP_NAME \
    --description "Security group for MAK Realty App" \
    --vpc-id $VPC_ID \
    --query 'GroupId' \
    --output text \
    --region $AWS_REGION)

  # Add inbound rules
  echo "Adding security group rules..."
  aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 22 --cidr 0.0.0.0/0 --region $AWS_REGION   # SSH
  aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 80 --cidr 0.0.0.0/0 --region $AWS_REGION   # HTTP
  aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 443 --cidr 0.0.0.0/0 --region $AWS_REGION  # HTTPS
fi
echo "Security Group ID: $SG_ID"

# Check if key pair exists
echo "Checking key pair..."
KEY_EXISTS=$(aws ec2 describe-key-pairs --key-names $KEY_NAME --query 'KeyPairs[0].KeyName' --output text --region $AWS_REGION 2>/dev/null || echo "None")

if [ "$KEY_EXISTS" == "None" ]; then
  echo "Creating new key pair: $KEY_NAME"
  aws ec2 create-key-pair \
    --key-name $KEY_NAME \
    --query 'KeyMaterial' \
    --output text \
    --region $AWS_REGION > ${KEY_NAME}.pem
  chmod 400 ${KEY_NAME}.pem
  echo "Key pair saved to: ${KEY_NAME}.pem"
  echo "IMPORTANT: Keep this file safe - you'll need it to SSH into the instance!"
else
  echo "Key pair '$KEY_NAME' already exists"
fi

# Get latest Ubuntu 22.04 AMI
echo "Finding latest Ubuntu 22.04 AMI..."
AMI_ID=$(aws ec2 describe-images \
  --owners 099720109477 \
  --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*" \
            "Name=state,Values=available" \
  --query 'sort_by(Images, &CreationDate)[-1].ImageId' \
  --output text \
  --region $AWS_REGION)
echo "AMI ID: $AMI_ID"

# Launch EC2 instance
echo "Launching EC2 instance..."
INSTANCE_ID=$(aws ec2 run-instances \
  --image-id $AMI_ID \
  --instance-type $INSTANCE_TYPE \
  --key-name $KEY_NAME \
  --security-group-ids $SG_ID \
  --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$INSTANCE_NAME}]" \
  --query 'Instances[0].InstanceId' \
  --output text \
  --region $AWS_REGION)
echo "Instance ID: $INSTANCE_ID"

# Wait for instance to be running
echo "Waiting for instance to be running..."
aws ec2 wait instance-running --instance-ids $INSTANCE_ID --region $AWS_REGION

# Get public IP
PUBLIC_IP=$(aws ec2 describe-instances \
  --instance-ids $INSTANCE_ID \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text \
  --region $AWS_REGION)

echo ""
echo "========================================="
echo "EC2 Instance Created Successfully!"
echo "========================================="
echo "Instance ID: $INSTANCE_ID"
echo "Public IP: $PUBLIC_IP"
echo "Key File: ${KEY_NAME}.pem"
echo ""
echo "Next Steps:"
echo "1. Wait a minute for the instance to fully initialize"
echo "2. Run EC2 setup script:"
echo "   ssh -i ${KEY_NAME}.pem ubuntu@$PUBLIC_IP 'bash -s' < ec2-setup.sh"
echo ""
echo "3. Update .env.production with the public IP:"
echo "   FRONTEND_URL=http://$PUBLIC_IP"
echo "   REACT_APP_API_URL=http://$PUBLIC_IP"
echo ""
echo "4. Deploy the application:"
echo "   EC2_HOST=$PUBLIC_IP SSH_KEY_PATH=./${KEY_NAME}.pem ./deploy-aws.sh"
echo ""
echo "5. Access the application at: http://$PUBLIC_IP"
echo "========================================="

# Save instance info
echo "$PUBLIC_IP" > ec2-public-ip.txt
echo "Public IP saved to: ec2-public-ip.txt"
