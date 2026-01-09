# MAK Kotwal Realty - Deployment Guide

## 🏗️ Project Overview

This is a complete Real Estate Project Management System with:
- **5 Pages**: Welcome, Login, Dashboard, Search, Upload
- **User/Admin Roles**: Admin can hide/show project fields
- **2FA Authentication**: OTP via email
- **Excel Bulk Upload**: Import multiple projects at once
- **Media Management**: Upload floor plans, videos, brochures

---

## 📁 Project Structure

```
mak-realty-app/
├── backend/
│   ├── config/
│   │   └── database.js       # PostgreSQL connection
│   ├── middleware/
│   │   └── auth.js           # JWT authentication
│   ├── routes/
│   │   ├── auth.js           # Login, Register, 2FA
│   │   └── projects.js       # CRUD, Search, Media
│   ├── uploads/              # Uploaded media files
│   ├── server.js             # Express server
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── template.csv      # Excel template
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── WelcomePage.js
│   │   │   ├── LoginPage.js
│   │   │   ├── DashboardPage.js
│   │   │   ├── SearchPage.js
│   │   │   └── UploadPage.js
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
│
└── DEPLOYMENT_GUIDE.md
```

---

## 🚀 FREE HOSTING OPTIONS

### Option 1: AWS Free Tier (Recommended)

#### Step 1: Set Up AWS Account
1. Go to https://aws.amazon.com/free
2. Create a new AWS account (requires credit card for verification)
3. You get 12 months of free tier access

#### Step 2: Set Up RDS (PostgreSQL Database)
```bash
# In AWS Console:
1. Go to RDS → Create Database
2. Select "PostgreSQL"
3. Choose "Free tier" template
4. Settings:
   - DB instance identifier: mak-realty-db
   - Master username: postgres
   - Master password: [create strong password]
5. Instance configuration: db.t3.micro (free tier)
6. Storage: 20 GB (free tier)
7. Connectivity:
   - Public access: Yes (for development)
   - VPC security group: Create new
8. Create database

# Note the endpoint URL, it will look like:
# mak-realty-db.xxxxx.us-east-1.rds.amazonaws.com
```

#### Step 3: Set Up EC2 (Backend Server)
```bash
# In AWS Console:
1. Go to EC2 → Launch Instance
2. Name: mak-realty-server
3. AMI: Amazon Linux 2023 (free tier eligible)
4. Instance type: t2.micro (free tier)
5. Key pair: Create new → Download .pem file
6. Network settings:
   - Allow SSH from My IP
   - Allow HTTP from Anywhere
   - Allow HTTPS from Anywhere
   - Add Custom TCP Rule: Port 5000 from Anywhere
7. Storage: 8 GB (free tier)
8. Launch instance

# Connect to your instance:
ssh -i your-key.pem ec2-user@your-ec2-public-ip
```

#### Step 4: Install Node.js on EC2
```bash
# On your EC2 instance:
sudo yum update -y
sudo yum install -y nodejs npm git

# Verify installation
node --version
npm --version
```

#### Step 5: Clone and Configure Backend
```bash
# On EC2:
cd ~
git clone <your-repo-url> mak-realty-app
# Or upload files via SCP:
# scp -i your-key.pem -r ./mak-realty-app ec2-user@your-ec2-ip:~/

cd mak-realty-app/backend

# Create .env file
cat > .env << EOF
PORT=5000
NODE_ENV=production
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@your-rds-endpoint:5432/postgres
JWT_SECRET=$(openssl rand -base64 32)
FRONTEND_URL=https://your-frontend-url.com
EOF

# Install dependencies
npm install

# Start with PM2 (process manager)
npm install -g pm2
pm2 start server.js --name mak-realty-api
pm2 save
pm2 startup
```

#### Step 6: Set Up S3 for Frontend (Static Hosting)
```bash
# In AWS Console:
1. Go to S3 → Create bucket
2. Bucket name: mak-realty-frontend (must be unique globally)
3. Uncheck "Block all public access"
4. Create bucket

5. Go to bucket → Properties → Static website hosting → Enable
6. Index document: index.html
7. Error document: index.html

8. Go to Permissions → Bucket policy → Add:
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::mak-realty-frontend/*"
        }
    ]
}
```

#### Step 7: Build and Deploy Frontend
```bash
# On your local machine:
cd frontend

# Update API URL in src/utils/api.js
# Change API_URL to your EC2 public IP or domain

# Build
npm install
npm run build

# Upload to S3
aws s3 sync build/ s3://mak-realty-frontend --delete

# Your site is now live at:
# http://mak-realty-frontend.s3-website-us-east-1.amazonaws.com
```

---

### Option 2: Render + Supabase (100% Free, No Credit Card)

#### Step 1: Set Up Supabase (Database)
```bash
1. Go to https://supabase.com
2. Sign up with GitHub
3. Create new project
4. Note your:
   - Project URL
   - Database URL (Settings → Database → Connection string)
   - Anon/public key
```

#### Step 2: Deploy Backend to Render
```bash
1. Go to https://render.com
2. Sign up with GitHub
3. New → Web Service
4. Connect your GitHub repo
5. Settings:
   - Name: mak-realty-api
   - Environment: Node
   - Build Command: cd backend && npm install
   - Start Command: cd backend && node server.js
6. Add Environment Variables:
   - PORT=10000
   - NODE_ENV=production
   - DATABASE_URL=your-supabase-connection-string
   - JWT_SECRET=your-secret-key
7. Deploy
```

#### Step 3: Deploy Frontend to Render
```bash
1. New → Static Site
2. Connect your GitHub repo
3. Settings:
   - Name: mak-realty-frontend
   - Build Command: cd frontend && npm install && npm run build
   - Publish Directory: frontend/build
4. Add Environment Variable:
   - REACT_APP_API_URL=https://mak-realty-api.onrender.com
5. Deploy
```

---

### Option 3: Vercel + Railway (Easiest)

#### Frontend on Vercel
```bash
1. Go to https://vercel.com
2. Import your GitHub repo
3. Framework: Create React App
4. Root Directory: frontend
5. Add Environment Variable:
   - REACT_APP_API_URL=your-railway-backend-url
6. Deploy
```

#### Backend on Railway
```bash
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select your repo
4. Add PostgreSQL plugin
5. Add Environment Variables:
   - PORT=${{PORT}}
   - DATABASE_URL=${{DATABASE_URL}}
   - JWT_SECRET=your-secret-key
6. Deploy
```

---

## 🔧 Local Development

```bash
# Terminal 1 - Backend
cd backend
cp .env.example .env
# Edit .env with your local PostgreSQL credentials
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm start

# Open http://localhost:3000
```

---

## 👤 Default Admin Setup

After deployment, register the first admin user:

```bash
# Using curl or Postman:
POST /api/auth/register
{
  "email": "admin@makkotwlarealty.com",
  "password": "your-secure-password",
  "name": "Admin User",
  "role": "admin"
}
```

---

## 🔐 Security Checklist

- [ ] Change default JWT_SECRET
- [ ] Use HTTPS in production
- [ ] Set up proper CORS origins
- [ ] Enable 2FA for all admin accounts
- [ ] Set up database backups
- [ ] Use strong passwords
- [ ] Keep dependencies updated

---

## 📊 Database Schema

The application automatically creates these tables:
- `users` - User accounts and authentication
- `projects` - Project listings
- `project_media` - Floor plans, videos, brochures
- `otp_codes` - Two-factor authentication codes
- `activity_logs` - Audit trail

---

## 🆘 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is accessible
psql -h your-host -U your-user -d your-database

# For AWS RDS, ensure security group allows your IP
```

### CORS Errors
```bash
# Update FRONTEND_URL in backend .env
FRONTEND_URL=https://your-actual-frontend-url.com
```

### File Upload Issues
```bash
# Ensure uploads directory exists and has write permissions
mkdir -p uploads
chmod 755 uploads
```

---

## 📞 Support

For issues or questions, create a GitHub issue or contact the development team.

---

**Built for MAK Kotwal Realty** 🏢
