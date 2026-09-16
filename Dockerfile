# Multi-stage Docker build for Fehem
# Compatible with AWS Lambda (via Lambda Web Adapter), Google Cloud Run, AWS ECS/App Runner, and Docker VPS

FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY package*.json ./

# Install all dependencies for build
RUN npm ci

# Copy source code
COPY . .

# Build Vite client and esbuild server into dist/
RUN npm run build

# Production Runner Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV AWS_LWA_PORT=3000

# Include official AWS Lambda Web Adapter (enables running directly on AWS Lambda container runtime)
COPY --from=public.ecr.aws/awslambda/aws-lambda-adapter:0.8.4 /lambda-adapter /opt/extensions/lambda-adapter

# Copy dependency files and install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled dist bundle from builder
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Start compiled CommonJS server
CMD ["node", "dist/server.cjs"]
