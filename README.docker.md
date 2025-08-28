# Docker Setup for Melanie Backend

This project includes Docker configurations for both development and production environments.

## Files Overview

- `Dockerfile` - Production-ready multi-stage build
- `Dockerfile.dev` - Development build with hot reloading
- `docker-compose.yml` - Production environment
- `docker-compose.dev.yml` - Development environment
- `.env.example` - Environment variables template

## Quick Start

### Development Environment

1. **Copy environment variables:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file with your configuration:**
   - Database credentials
   - Google Drive API keys
   - JWT secrets

3. **Start development environment:**
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

4. **Run database migrations:**
   ```bash
   docker-compose -f docker-compose.dev.yml exec app pnpm prisma migrate deploy
   ```

5. **Access the application:**
   - API: http://localhost:3000
   - Database: localhost:5432
   - Redis: localhost:6379

### Production Environment

1. **Start production environment:**
   ```bash
   docker-compose up --build -d
   ```

2. **Run database migrations:**
   ```bash
   docker-compose exec app pnpm prisma migrate deploy
   ```

## Environment Variables

### Required Variables

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/melanie_db
DATABASE_NAME=melanie_db
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

# Application
NODE_ENV=production
PORT=3000
JWT_SECRET=your_jwt_secret

# Google Drive API
GOOGLE_DRIVE_CLIENT_ID=your_client_id
GOOGLE_DRIVE_CLIENT_SECRET=your_client_secret
```

## Development Features

- **Hot Reloading**: Source code changes are automatically reflected
- **Debugging**: Debug port 9229 exposed for Node.js debugging
- **Volume Mounts**: Source code mounted for real-time development
- **Separate Database**: Uses `melanie_dev` database to avoid conflicts

## Production Features

- **Multi-stage Build**: Optimized for smaller image size
- **Security**: Runs as non-root user
- **Health Checks**: Built-in health monitoring
- **Memory Optimization**: Configured for efficient memory usage
- **Persistent Data**: PostgreSQL and Redis data persisted in volumes

## Useful Commands

### Development

```bash
# Start services
docker-compose -f docker-compose.dev.yml up

# Rebuild and start
docker-compose -f docker-compose.dev.yml up --build

# View logs
docker-compose -f docker-compose.dev.yml logs -f app

# Execute commands in container
docker-compose -f docker-compose.dev.yml exec app pnpm prisma studio

# Stop services
docker-compose -f docker-compose.dev.yml down
```

### Production

```bash
# Start services in background
docker-compose up -d

# View logs
docker-compose logs -f app

# Scale application
docker-compose up --scale app=3

# Stop services
docker-compose down

# Remove volumes (careful!)
docker-compose down -v
```

### Database Operations

```bash
# Run migrations
docker-compose exec app pnpm prisma migrate deploy

# Generate Prisma client
docker-compose exec app pnpm prisma generate

# Open Prisma Studio
docker-compose exec app pnpm prisma studio

# Reset database (development only)
docker-compose -f docker-compose.dev.yml exec app pnpm prisma migrate reset
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in `.env` file if 3000, 5432, or 6379 are in use
2. **Permission issues**: Ensure Docker has access to project directory
3. **Memory issues**: Increase Docker memory allocation in Docker Desktop
4. **Database connection**: Wait for PostgreSQL health check to pass

### Debugging

1. **Check container logs:**
   ```bash
   docker-compose logs app
   ```

2. **Access container shell:**
   ```bash
   docker-compose exec app sh
   ```

3. **Check container health:**
   ```bash
   docker-compose ps
   ```

## Railway Deployment

For Railway deployment, only the main `Dockerfile` is needed. Railway will automatically:

1. Detect the Dockerfile
2. Build the production image
3. Deploy the container
4. Handle environment variables through Railway dashboard

Make sure to set the required environment variables in Railway's dashboard before deployment.