# Artist Marketplace - Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Deployment](#database-deployment)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Domain & SSL Configuration](#domain--ssl-configuration)
7. [CI/CD Pipeline Setup](#cicd-pipeline-setup)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- Node.js 16+ and npm/yarn
- MongoDB 4.4+
- Git
- Domain name (for production)
- Cloud hosting account (AWS, DigitalOcean, Heroku, etc.)

### Required Accounts
- [ ] MongoDB Atlas account (for database)
- [ ] Cloudinary account (for image storage)
- [ ] Email service provider (SendGrid, Mailgun, etc.)
- [ ] Payment processor (Stripe)
- [ ] Hosting provider account
- [ ] Domain registrar account

## Environment Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/Artist-Marketplace.git
cd Artist-Marketplace
```

### 2. Install Dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 3. Environment Configuration

#### Backend Environment Variables
Create `server/.env` file:
```env
# Server Configuration
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://yourdomain.com

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/artist-marketplace

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Configuration
EMAIL_SERVICE=sendgrid
EMAIL_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@yourdomain.com

# Payment Configuration
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Security
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend Environment Variables
Create `client/.env` file:
```env
# API Configuration
REACT_APP_API_URL=https://api.yourdomain.com/api

# Stripe Configuration
REACT_APP_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# Analytics (Optional)
REACT_APP_GOOGLE_ANALYTICS_ID=your-ga-id
```

## Database Deployment

### MongoDB Atlas Setup

#### 1. Create MongoDB Atlas Cluster
```bash
# Go to MongoDB Atlas (https://cloud.mongodb.com)
# 1. Create new project
# 2. Build a cluster (choose shared for free tier)
# 3. Choose cloud provider and region
# 4. Create cluster
```

#### 2. Configure Database Access
```bash
# 1. Go to Database Access
# 2. Add new database user
# 3. Set username and password
# 4. Grant read/write access to specific database
```

#### 3. Configure Network Access
```bash
# 1. Go to Network Access
# 2. Add IP address (0.0.0.0/0 for all IPs or specific server IPs)
# 3. Confirm entry
```

#### 4. Get Connection String
```bash
# 1. Go to Clusters
# 2. Click "Connect"
# 3. Choose "Connect your application"
# 4. Copy connection string
# 5. Replace <password> and <dbname> in connection string
```

### Local Database Setup (Alternative)
```bash
# Install MongoDB locally
# Ubuntu/Debian
sudo apt update
sudo apt install mongodb

# macOS
brew install mongodb-community

# Windows
# Download from https://www.mongodb.com/try/download/community

# Start MongoDB service
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

## Backend Deployment

### Option 1: Heroku Deployment

#### 1. Install Heroku CLI
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login
```

#### 2. Create Heroku App
```bash
cd server
heroku create your-app-name-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI="your-mongodb-connection-string"
heroku config:set JWT_SECRET="your-jwt-secret"
heroku config:set CLOUDINARY_CLOUD_NAME="your-cloud-name"
heroku config:set CLOUDINARY_API_KEY="your-api-key"
heroku config:set CLOUDINARY_API_SECRET="your-api-secret"
# ... add all other environment variables
```

#### 3. Deploy to Heroku
```bash
# Add Heroku remote
git remote add heroku https://git.heroku.com/your-app-name-api.git

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### Option 2: DigitalOcean Droplet

#### 1. Create Droplet
```bash
# 1. Go to DigitalOcean dashboard
# 2. Create new droplet
# 3. Choose Ubuntu 20.04 LTS
# 4. Select size ($5/month minimum)
# 5. Add SSH key
# 6. Create droplet
```

#### 2. Server Setup
```bash
# Connect to server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2 (Process Manager)
npm install -g pm2

# Install Nginx
apt install nginx -y

# Install certbot for SSL
apt install certbot python3-certbot-nginx -y
```

#### 3. Deploy Application
```bash
# Clone repository
cd /var/www
git clone https://github.com/yourusername/Artist-Marketplace.git
cd Artist-Marketplace/server

# Install dependencies
npm install --production

# Create .env file
nano .env
# (Paste environment variables)

# Start application with PM2
pm2 start server.js --name "artist-marketplace-api"
pm2 startup
pm2 save
```

#### 4. Configure Nginx
```bash
# Create Nginx configuration
nano /etc/nginx/sites-available/artist-marketplace-api

# Add configuration:
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
ln -s /etc/nginx/sites-available/artist-marketplace-api /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Option 3: AWS EC2 Deployment

#### 1. Launch EC2 Instance
```bash
# 1. Go to AWS Console
# 2. Launch EC2 instance
# 3. Choose Amazon Linux 2 AMI
# 4. Select t2.micro (free tier)
# 5. Configure security groups (ports 22, 80, 443)
# 6. Launch instance
```

#### 2. Setup EC2 Instance
```bash
# Connect to instance
ssh -i your-key.pem ec2-user@your-ec2-ip

# Update system
sudo yum update -y

# Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install node

# Install PM2
npm install -g pm2

# Install Git
sudo yum install git -y
```

#### 3. Deploy Application
```bash
# Clone and setup (same as DigitalOcean steps)
cd /home/ec2-user
git clone https://github.com/yourusername/Artist-Marketplace.git
cd Artist-Marketplace/server
npm install --production

# Create .env file and start with PM2
# (Same steps as DigitalOcean)
```

## Frontend Deployment

### Option 1: Netlify Deployment

#### 1. Build Production Files
```bash
cd client
npm run build
```

#### 2. Deploy to Netlify
```bash
# Method 1: Drag and drop build folder to Netlify

# Method 2: Netlify CLI
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=build
```

#### 3. Configure Netlify
```bash
# Create netlify.toml in client root
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build]
  command = "npm run build"
  publish = "build"

[build.environment]
  REACT_APP_API_URL = "https://api.yourdomain.com/api"
  REACT_APP_STRIPE_PUBLISHABLE_KEY = "your-stripe-key"
```

### Option 2: Vercel Deployment

#### 1. Install Vercel CLI
```bash
npm install -g vercel
vercel login
```

#### 2. Deploy
```bash
cd client
vercel --prod

# Set environment variables in Vercel dashboard
# or via CLI:
vercel env add REACT_APP_API_URL production
```

### Option 3: Self-hosted with Nginx

#### 1. Build and Transfer Files
```bash
# Build locally
cd client
npm run build

# Transfer to server
scp -r build/* root@your-server-ip:/var/www/html/
```

#### 2. Configure Nginx
```bash
# Create Nginx configuration
nano /etc/nginx/sites-available/artist-marketplace

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Enable site
ln -s /etc/nginx/sites-available/artist-marketplace /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

## Domain & SSL Configuration

### 1. Configure DNS
```bash
# Add DNS records at your domain registrar:
# A record: yourdomain.com -> your-server-ip
# A record: www.yourdomain.com -> your-server-ip
# A record: api.yourdomain.com -> your-api-server-ip
```

### 2. SSL Certificate (Let's Encrypt)
```bash
# For Nginx server
certbot --nginx -d yourdomain.com -d www.yourdomain.com
certbot --nginx -d api.yourdomain.com

# Test auto-renewal
certbot renew --dry-run
```

### 3. Configure Auto-renewal
```bash
# Add to crontab
crontab -e

# Add line:
0 12 * * * /usr/bin/certbot renew --quiet
```

## CI/CD Pipeline Setup

### GitHub Actions Workflow

#### 1. Create Workflow File
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install backend dependencies
      run: |
        cd server
        npm install
        
    - name: Install frontend dependencies
      run: |
        cd client
        npm install
        
    - name: Run backend tests
      run: |
        cd server
        npm test
        
    - name: Run frontend tests
      run: |
        cd client
        npm test -- --coverage --watchAll=false

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{secrets.HEROKU_API_KEY}}
        heroku_app_name: "your-app-name-api"
        heroku_email: "your-email@example.com"
        appdir: "server"

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install and build
      run: |
        cd client
        npm install
        npm run build
        
    - name: Deploy to Netlify
      uses: nwtgck/actions-netlify@v1.2
      with:
        publish-dir: './client/build'
        production-branch: main
        github-token: ${{ secrets.GITHUB_TOKEN }}
        deploy-message: "Deploy from GitHub Actions"
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

#### 2. Configure Secrets
```bash
# Add these secrets in GitHub repository settings:
# HEROKU_API_KEY
# NETLIFY_AUTH_TOKEN
# NETLIFY_SITE_ID
```

## Monitoring & Maintenance

### 1. Application Monitoring
```bash
# Install monitoring tools
npm install -g pm2

# Monitor PM2 processes
pm2 monit

# View logs
pm2 logs

# Restart application
pm2 restart artist-marketplace-api
```

### 2. Server Monitoring
```bash
# Install htop for system monitoring
apt install htop

# Check disk usage
df -h

# Check memory usage
free -h

# Check running processes
ps aux | grep node
```

### 3. Database Monitoring
```bash
# MongoDB Atlas provides built-in monitoring
# For self-hosted MongoDB:
mongotop
mongostat
```

### 4. Backup Strategy
```bash
# Database backup (MongoDB Atlas)
# Atlas provides automatic backups

# For self-hosted MongoDB:
mongodump --uri="mongodb://localhost:27017/artist-marketplace" --out=/backup/

# Application backup
tar -czf app-backup-$(date +%Y%m%d).tar.gz /var/www/Artist-Marketplace/
```

### 5. Log Management
```bash
# Configure log rotation
nano /etc/logrotate.d/artist-marketplace

/var/log/artist-marketplace/*.log {
    daily
    missingok
    rotate 14
    compress
    notifempty
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

## Troubleshooting

### Common Issues & Solutions

#### 1. Application Won't Start
```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs artist-marketplace-api

# Check environment variables
pm2 env 0

# Restart application
pm2 restart artist-marketplace-api
```

#### 2. Database Connection Issues
```bash
# Test MongoDB connection
mongo "your-connection-string"

# Check firewall rules
ufw status

# Check MongoDB Atlas IP whitelist
# Ensure server IP is whitelisted
```

#### 3. SSL Certificate Issues
```bash
# Check certificate status
certbot certificates

# Renew certificates
certbot renew

# Check Nginx configuration
nginx -t
```

#### 4. CORS Issues
```bash
# Check CORS configuration in server
# Ensure CORS_ORIGIN environment variable is set correctly
# Verify frontend URL matches CORS settings
```

#### 5. High Server Load
```bash
# Check system resources
htop
df -h
free -h

# Check application logs for errors
pm2 logs

# Restart services if needed
pm2 restart all
systemctl restart nginx
```

### Performance Optimization

#### 1. Enable Gzip Compression
```nginx
# Add to Nginx configuration
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

#### 2. Configure Caching
```nginx
# Add to Nginx configuration
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

#### 3. Database Optimization
```javascript
// Add database indexes (already in Artwork model)
// Monitor query performance
// Use MongoDB Atlas Performance Advisor
```

## Security Checklist

### Pre-deployment Security
- [ ] Environment variables are secure and not in version control
- [ ] JWT secrets are strong and unique
- [ ] Database has authentication enabled
- [ ] API rate limiting is configured
- [ ] CORS is properly configured
- [ ] Input validation is implemented
- [ ] SQL injection protection is in place
- [ ] XSS protection is enabled

### Post-deployment Security
- [ ] SSL certificates are installed and working
- [ ] Firewall is configured (only necessary ports open)
- [ ] Regular security updates are scheduled
- [ ] Backup strategy is implemented
- [ ] Monitoring and alerting is set up
- [ ] Access logs are being collected
- [ ] Regular security audits are planned

---

## Deployment Checklist

### Pre-deployment
- [ ] All tests pass
- [ ] Environment variables are configured
- [ ] Database is set up and accessible
- [ ] Domain name is configured
- [ ] SSL certificates are ready

### Deployment
- [ ] Backend is deployed and running
- [ ] Frontend is deployed and accessible
- [ ] Database migrations are complete
- [ ] Environment variables are set in production
- [ ] SSL is configured and working

### Post-deployment
- [ ] Application is accessible via domain
- [ ] All features are working correctly
- [ ] Performance is acceptable
- [ ] Monitoring is set up
- [ ] Backup strategy is implemented
- [ ] Documentation is updated

This comprehensive deployment guide covers all aspects of deploying the Artist Marketplace application from development to production, including multiple hosting options, security considerations, and ongoing maintenance procedures.