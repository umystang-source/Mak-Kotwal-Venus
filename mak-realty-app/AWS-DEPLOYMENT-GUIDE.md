# AWS Deployment Guide - MAK Realty App

Complete guide to deploy your real estate management application on AWS for up to 1000 users.

## Architecture Overview

```
┌─────────────────────┐
│   Route 53 (DNS)    │ ← Optional: Your domain
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│   EC2 Instance      │ ← Application Server
│  - Frontend (Nginx) │
│  - Backend (Node.js)│
│  - Docker           │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  RDS PostgreSQL     │ ← Database (Optional upgrade)
└─────────────────────┘
```

## Prerequisites

1. AWS Account with billing enabled
2. AWS CLI installed on your local machine
3. SSH key pair for EC2 access
4. Domain name (optional but recommended)

## Cost Estimate (Monthly)

For 1000 users:
- EC2 t3.small: ~$15/month
- RDS (optional): ~$15-25/month OR use PostgreSQL in Docker: $0
- Data Transfer: ~$5-10/month
- **Total: ~$20-50/month**

## Step-by-Step Deployment

### Step 1: Create EC2 Instance

1. **Log into AWS Console**
   - Go to EC2 Dashboard
   - Click "Launch Instance"

2. **Configure Instance**
   - Name: `mak-realty-app`
   - AMI: Ubuntu Server 22.04 LTS
   - Instance type: `t3.small` (2 vCPU, 2GB RAM)
   - Key pair: Create new or select existing
   - Network settings:
     - Allow SSH (port 22) from your IP
     - Allow HTTP (port 80) from anywhere
     - Allow HTTPS (port 443) from anywhere (if using SSL)
     - Allow Custom TCP (port 5000) from anywhere (for API)
   - Storage: 20 GB gp3

3. **Launch Instance**
   - Download your key pair (.pem file) if creating new
   - Save it securely

### Step 2: Connect to EC2 Instance

```bash
# Make key file read-only
chmod 400 your-key.pem

# Connect to EC2
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### Step 3: Install Docker on EC2

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for group changes
exit
# SSH back in
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

# Verify installation
docker --version
docker-compose --version
```

### Step 4: Prepare Environment Configuration

**On your local machine:**

1. Copy the example environment file:
```bash
cd mak-realty-app
cp .env.production.example .env.production
```

2. Edit `.env.production` with your actual values:
```bash
# Use nano, vim, or any text editor
nano .env.production
```

3. Update these values:
```env
# Database (using Docker PostgreSQL)
DATABASE_URL=postgresql://mak_user:YOUR_SECURE_PASSWORD@postgres:5432/mak_realty
POSTGRES_USER=mak_user
POSTGRES_PASSWORD=YOUR_SECURE_PASSWORD
POSTGRES_DB=mak_realty

# JWT Secret (Generate with: openssl rand -base64 32)
JWT_SECRET=YOUR_GENERATED_JWT_SECRET

# URLs (Replace with your EC2 public IP)
FRONTEND_URL=http://YOUR_EC2_PUBLIC_IP
REACT_APP_API_URL=http://YOUR_EC2_PUBLIC_IP:5000

# Production mode
NODE_ENV=production
PORT=5000
```

### Step 5: Deploy the Application

**Option A: Using the Deployment Script (Recommended)**

1. Make the script executable:
```bash
chmod +x deploy-aws.sh
```

2. Set environment variables:
```bash
export EC2_HOST=YOUR_EC2_PUBLIC_IP
export SSH_KEY_PATH=path/to/your-key.pem
```

3. Run deployment:
```bash
./deploy-aws.sh
```

**Option B: Manual Deployment**

1. Create deployment package:
```bash
tar -czf deploy.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='build' \
  backend frontend docker-compose.yml .env.production
```

2. Upload to EC2:
```bash
scp -i your-key.pem deploy.tar.gz ubuntu@YOUR_EC2_PUBLIC_IP:/home/ubuntu/
```

3. SSH into EC2 and deploy:
```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

# Extract files
mkdir -p mak-realty-app
cd mak-realty-app
tar -xzf ../deploy.tar.gz

# Copy environment file
cp .env.production backend/.env

# Build and start
docker-compose build
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs -f
```

### Step 6: Verify Deployment

1. Check if containers are running:
```bash
docker-compose ps
```

You should see:
- `mak-realty-app_frontend_1` (running on port 80)
- `mak-realty-app_backend_1` (running on port 5000)
- `mak-realty-app_postgres_1` (running on port 5432)

2. Test the application:
```bash
# Test backend health
curl http://localhost:5000/api/health

# From your browser
http://YOUR_EC2_PUBLIC_IP
```

### Step 7: Set Up Domain (Optional but Recommended)

1. **In Route 53 or your DNS provider:**
   - Create an A record pointing to your EC2 public IP
   - Example: `app.yourdomain.com` → `YOUR_EC2_PUBLIC_IP`

2. **Update environment variables:**
```bash
# Edit .env.production
FRONTEND_URL=http://app.yourdomain.com
```

3. **Restart containers:**
```bash
docker-compose down
docker-compose up -d
```

### Step 8: Set Up SSL Certificate (Recommended for Production)

1. **Install Certbot:**
```bash
sudo apt install certbot python3-certbot-nginx -y
```

2. **Update nginx configuration** in `frontend/nginx.conf` to include your domain

3. **Get SSL certificate:**
```bash
sudo certbot --nginx -d app.yourdomain.com
```

4. **Auto-renewal:**
```bash
sudo certbot renew --dry-run
```

## Maintenance Commands

### View logs:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Restart services:
```bash
docker-compose restart
```

### Update application:
```bash
# Pull latest code or upload new files
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Backup database:
```bash
docker-compose exec postgres pg_dump -U mak_user mak_realty > backup.sql
```

### Restore database:
```bash
cat backup.sql | docker-compose exec -T postgres psql -U mak_user mak_realty
```

## Monitoring & Performance

### Check resource usage:
```bash
docker stats
```

### Monitor system:
```bash
htop
df -h  # Disk space
free -h  # Memory
```

### CloudWatch (Optional):
Set up CloudWatch agent for detailed monitoring of your EC2 instance.

## Scaling for More Users

If you exceed 1000 users:

1. **Vertical Scaling:**
   - Upgrade to t3.medium (4GB RAM)
   - Use AWS Application Load Balancer

2. **Horizontal Scaling:**
   - Use ECS/Fargate for container orchestration
   - Add read replicas for PostgreSQL
   - Use CloudFront CDN for static assets

3. **Database:**
   - Migrate to RDS PostgreSQL for better performance
   - Enable automated backups

## Security Checklist

- [ ] Change default passwords in `.env.production`
- [ ] Set up SSL certificate (Let's Encrypt)
- [ ] Configure security groups properly
- [ ] Enable CloudWatch logging
- [ ] Set up automated backups
- [ ] Use AWS Secrets Manager for sensitive data
- [ ] Enable VPC with private subnets for database
- [ ] Set up fail2ban for SSH protection
- [ ] Regular security updates: `sudo apt update && sudo apt upgrade`

## Troubleshooting

### Application not accessible:
1. Check EC2 security group allows ports 80 and 5000
2. Verify containers are running: `docker-compose ps`
3. Check logs: `docker-compose logs`

### Database connection errors:
1. Verify PostgreSQL container is running
2. Check DATABASE_URL in `.env`
3. Ensure database was initialized: `docker-compose logs postgres`

### Out of memory:
1. Check container resource usage: `docker stats`
2. Upgrade to larger instance type
3. Optimize queries and add database indexes

### Frontend can't connect to backend:
1. Verify REACT_APP_API_URL in environment
2. Check CORS settings in backend
3. Ensure port 5000 is accessible

## Cost Optimization Tips

1. Use reserved instances for 30-50% savings
2. Stop instance during off-hours if not 24/7
3. Use gp3 storage instead of gp2
4. Enable CloudWatch billing alerts
5. Use AWS Free Tier for first 12 months

## Support

For issues:
1. Check logs: `docker-compose logs`
2. Verify environment variables
3. Check AWS service status
4. Review security group rules

## Next Steps

After successful deployment:
1. Set up automated backups
2. Configure monitoring and alerts
3. Create admin user in the application
4. Test all features
5. Set up CI/CD pipeline (optional)

---

**Estimated Deployment Time:** 30-45 minutes

**Monthly Cost:** ~$20-50 for 1000 users
