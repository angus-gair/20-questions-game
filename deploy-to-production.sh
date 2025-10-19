#!/bin/bash

set -e

echo "🚀 Deploying 20 Questions to Production Server"
echo "================================================"

# Configuration
REMOTE_USER="ghost"
REMOTE_HOST="100.74.51.28"
REMOTE_DIR="/home/ghost/projects/twentyquestions/20-questions-game"
DOCKER_COMPOSE_FILE="docker-compose.simple.yml"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Test SSH connection
echo "📡 Testing SSH connection to $REMOTE_USER@$REMOTE_HOST..."
ssh -o ConnectTimeout=10 $REMOTE_USER@$REMOTE_HOST "echo 'SSH connection successful'" || {
    echo -e "${RED}❌ SSH connection failed${NC}"
    exit 1
}

echo -e "${GREEN}✅ SSH connection successful${NC}"

# Deploy to production
echo "📦 Deploying to production..."
ssh $REMOTE_USER@$REMOTE_HOST << 'ENDSSH'
    set -e

    cd /home/ghost/projects/twentyquestions/20-questions-game

    # Pull latest code
    echo "🔄 Pulling latest code..."
    git pull origin main

    # Stop existing containers
    echo "🛑 Stopping existing containers..."
    docker compose -f docker-compose.simple.yml down || true

    # Build new image
    echo "🏗️ Building Docker image (this may take a few minutes)..."
    docker compose -f docker-compose.simple.yml build --no-cache

    # Start containers
    echo "🚀 Starting containers..."
    docker compose -f docker-compose.simple.yml up -d

    # Wait for container to be healthy
    echo "⏳ Waiting for application to start..."
    sleep 10

    # Check container status
    echo "📊 Container status:"
    docker ps | grep 20questions || echo "Container not found"

    # Check logs
    echo "📝 Recent logs:"
    docker logs 20questions --tail=20 || echo "Could not retrieve logs"

    # Check if server is listening
    echo "🔍 Checking if server is listening..."
    docker exec 20questions netstat -tulpn | grep 3000 || echo "Server not listening on port 3000"

ENDSSH

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "🌐 Application URL: https://20.ajinsights.com.au"
echo ""
echo "📝 Useful commands:"
echo "   View logs:     ssh $REMOTE_USER@$REMOTE_HOST 'docker logs 20questions -f'"
echo "   Check status:  ssh $REMOTE_USER@$REMOTE_HOST 'docker ps | grep 20questions'"
echo "   Restart:       ssh $REMOTE_USER@$REMOTE_HOST 'cd $REMOTE_DIR && docker compose -f $DOCKER_COMPOSE_FILE restart'"
echo "   Stop:          ssh $REMOTE_USER@$REMOTE_HOST 'cd $REMOTE_DIR && docker compose -f $DOCKER_COMPOSE_FILE down'"
echo ""
echo "🧪 Testing application..."
echo "   HTTP→HTTPS redirect test:"
ssh $REMOTE_USER@$REMOTE_HOST "curl -I http://20.ajinsights.com.au 2>&1 | grep -E 'HTTP|Location' | head -2" || echo "   Could not test redirect"

echo ""
echo "   HTTPS response test:"
ssh $REMOTE_USER@$REMOTE_HOST "curl -k -I https://20.ajinsights.com.au 2>&1 | grep HTTP | head -1" || echo "   Could not test HTTPS"

echo ""
echo -e "${GREEN}🎉 Deployment successful!${NC}"
