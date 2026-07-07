#!/bin/bash
set -e

echo "🚀 Deploying Accounting App..."

# Load environment
set -a
source .env.production
set +a

# Pull latest code
git pull origin main

# Build and start containers
docker compose -f docker-compose.yml up -d --build

# Run migrations
docker compose exec -T app php artisan migrate --force

# Clear and cache
docker compose exec -T app php artisan optimize:clear
docker compose exec -T app php artisan optimize
docker compose exec -T app php artisan storage:link

# Restart queue worker
docker compose restart queue-worker

echo "✅ Deployment complete!"
