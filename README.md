# Fehem - Micro-Learning Reels

Fehem is a high-performance micro-learning web application designed for coders and curious minds. It delivers concise, high-impact insights from world-class non-fiction books spanning psychology, human behavior, habits, focus, and Islamic wisdom, paired with interactive quizzes, actionable 2-minute challenges, and generative AI features.

---

## 🛠 Tech Stack & Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion, Lucide Icons
- **Audio Synthesis**: Web Audio API procedural soundscapes & binaural focus audio
- **Backend**: Express.js with server-side proxy routes
- **AI Integration**: Google Gemini API via `@google/genai`
- **Build System**: Vite 6 + esbuild (bundles server into `dist/server.cjs` and static client into `dist/`)

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js**: v20.x or later
- **npm** or **bun** / **yarn** / **pnpm**

### 2. Installation
```bash
# Clone repository and enter directory
git clone <your-repo-url>
cd fehem

# Install dependencies
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Add your Gemini API key:
```env
GEMINI_API_KEY="your-gemini-api-key-here"
NODE_ENV="development"
```

### 4. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 5. Production Build
```bash
# Builds client to dist/ and compiles server to dist/server.cjs
npm run build

# Start production server
npm start
```

---

## ☁️ Deployment Guide

### Option 1: AWS Lambda (Recommended: Container with AWS Lambda Web Adapter)

The cleanest and most reliable way to run a full Express + Vite application on AWS Lambda without altering application code is using the official **[AWS Lambda Web Adapter](https://github.com/awslabs/aws-lambda-web-adapter)**.

#### 1. Create a `Dockerfile`
Create a `Dockerfile` in the project root:

```dockerfile
# Multi-stage Docker build for AWS Lambda
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build Vite client and esbuild server
RUN npm run build

# Production Runner Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV AWS_LWA_PORT=3000

# Include AWS Lambda Web Adapter
COPY --from=public.ecr.aws/awslambda/aws-lambda-adapter:0.8.4 /lambda-adapter /opt/extensions/lambda-adapter

# Copy only production dependencies and built assets
COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Start server
CMD ["node", "dist/server.cjs"]
```

#### 2. Build and Test Container Locally
```bash
docker build -t fehem-app .
docker run -p 3000:3000 -e GEMINI_API_KEY="your-key" fehem-app
```

#### 3. Push to Amazon Elastic Container Registry (ECR)
```bash
# Authenticate Docker to your AWS ECR registry
aws ecr get-login-password --region <aws-region> | docker login --username AWS --password-stdin <aws-account-id>.dkr.ecr.<aws-region>.amazonaws.com

# Create repository (first time only)
aws ecr create-repository --repository-name fehem --region <aws-region>

# Tag and push image
docker tag fehem-app:latest <aws-account-id>.dkr.ecr.<aws-region>.amazonaws.com/fehem:latest
docker push <aws-account-id>.dkr.ecr.<aws-region>.amazonaws.com/fehem:latest
```

#### 4. Create & Configure the Lambda Function
1. Go to **AWS Lambda Console** > **Create function** > Select **Container image**.
2. Name the function `fehem-app` and select the image you pushed to ECR.
3. In **Configuration**:
   - **General configuration**: Set **Memory** to `1024 MB` or `2048 MB`, and **Timeout** to `30 seconds`.
   - **Environment variables**: Add `GEMINI_API_KEY` and `NODE_ENV=production`.
4. In **Function URL**:
   - Enable **Function URL** (Auth type: `NONE` for public web traffic).
   - Alternatively, configure an **API Gateway (HTTP API)** with a `$default` proxy route pointing to your Lambda function.

---

### Option 2: Google Cloud Run

Google Cloud Run offers serverless container hosting with automated HTTPS, zero-scaling, and simple deployments.

#### 1. Standard Production `Dockerfile`
If not using the Lambda Web Adapter layer, use this standard Dockerfile:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/server.cjs"]
```

#### 2. Deploy with Google Cloud CLI
```bash
# Build and deploy directly to Cloud Run
gcloud run deploy fehem \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars GEMINI_API_KEY="your-gemini-api-key"
```

---

### Option 3: AWS App Runner / Azure Container Apps / DigitalOcean

You can deploy the container image directly to:
- **AWS App Runner**: Connect your GitHub repository or ECR image, set Port to `3000`, and start command to `node dist/server.cjs`.
- **Render / Railway**: Connect repo, set build command to `npm install && npm run build`, and start command to `npm start`.
- **DigitalOcean App Platform**: Select "Web Service", Node environment, build command `npm run build`, run command `npm start`, HTTP port `3000`.

---

### Option 4: Linux Cloud VPS (Ubuntu / Debian / EC2)

For deploying on a virtual machine (e.g. AWS EC2, Hetzner, Linode, DigitalOcean Droplet):

#### 1. Setup Node.js & Clone Repo
```bash
# Update and install Node 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git

# Clone repo and build
git clone <repo-url> /var/www/fehem
cd /var/www/fehem
npm install
npm run build
```

#### 2. Configure PM2 Process Manager
```bash
sudo npm install -g pm2
pm2 start dist/server.cjs --name "fehem"
pm2 startup
pm2 save
```

#### 3. Setup Nginx Reverse Proxy
Install Nginx:
```bash
sudo apt-get install -y nginx
```

Create `/etc/nginx/sites-available/fehem`:
```nginx
server {
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site and configure SSL:
```bash
sudo ln -s /etc/nginx/sites-available/fehem /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Install free SSL certificate via Let's Encrypt
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 🔒 Environment Variables Reference

| Variable | Required | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Yes (for AI features) | API key for Google Gemini model generation (`/api/generate-reel`) |
| `NODE_ENV` | Optional | Set to `production` in production environments |
| `APP_URL` | Optional | Canonical public URL of the application |

---

## 🧪 Verification & Health Check

After deployment, verify that your service is running:
- Web App: Open `https://<your-deployed-domain>/`
- Health Endpoint: `https://<your-deployed-domain>/api/health`
  - Expected response: `{"status":"ok","hasGeminiKey":true}`
