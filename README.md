<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

Melanie Backend - A NestJS-based API for document and section management with Google Drive integration, role-based access control, and hierarchical content organization.

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/melanie_db"
GOOGLE_CLIENT_ID="your-service-account-email@project.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----"
```

## Database Setup

```bash
# Generate Prisma client
$ npx prisma generate

# Run database migrations
$ npx prisma migrate deploy

# (Optional) Seed the database
$ npx prisma db seed
```

## API Documentation

### Authentication

The API uses JWT-based authentication. All protected endpoints require a valid JWT token in the Authorization header.

#### Auth Endpoints

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and receive JWT token
- `GET /auth/profile` - Get current user profile (protected)

#### Example Login Request

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Core Endpoints

#### Sections

- `GET /sections` - Get all sections
- `GET /sections/tree` - **Get hierarchical section tree with documents**
- `GET /sections/:id` - Get section by ID
- `POST /sections` - Create new section
- `PATCH /sections/:id` - Update section
- `DELETE /sections/:id` - Delete section

#### Documents

- `GET /documents` - Get all documents
- `GET /documents/:id` - Get document by ID
- `POST /documents` - Create new document
- `PATCH /documents/:id` - Update document
- `DELETE /documents/:id` - Delete document

#### Users

- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `POST /users/:id/sync-drive` - Sync Google Drive content

#### Roles

- `GET /roles` - Get all roles
- `POST /roles` - Create new role
- `GET /roles/:id/sections` - Get section permissions for role
- `POST /roles/:id/sections` - Grant section access to role
- `DELETE /roles/:id/sections/:sectionId` - Remove section access

### Enhanced Sections Tree Endpoint

The `/sections/tree` endpoint now returns a comprehensive hierarchical structure including both sections and their associated documents:

#### Response Structure

```json
[
  {
    "id": "section-uuid",
    "name": "Section Name",
    "parentId": null,
    "documentCount": 3,
    "documents": [
      {
        "id": "document-uuid",
        "title": "Document Title",
        "url": "https://drive.google.com/file/d/...",
        "driveId": "google-drive-file-id",
        "sectionId": "section-uuid",
        "createdAt": "2025-01-15T10:30:00.000Z"
      }
    ],
    "children": [
      {
        "id": "child-section-uuid",
        "name": "Child Section",
        "parentId": "section-uuid",
        "documentCount": 1,
        "documents": [...],
        "children": []
      }
    ]
  }
]
```

#### Key Features

- **Hierarchical Structure**: Nested sections with unlimited depth
- **Document Integration**: Each section includes its associated documents
- **Google Drive Sync**: Documents include `driveId` for Google Drive integration
- **Performance Optimized**: Uses efficient database queries with proper indexing
- **Type Safety**: Fully typed with TypeScript interfaces

### Google Drive Integration

#### Setup

1. Create a Google Cloud Project
2. Enable Google Drive API
3. Create service account credentials
4. Download the service account JSON file
5. Extract the required values from the JSON file and add them to your `.env` file:
   - `GOOGLE_CLIENT_ID`: The service account email
   - `GOOGLE_PRIVATE_KEY`: The private key (with proper line breaks)
6. Optionally, place the complete JSON file in your project root for reference

#### Sync Functionality

- `POST /users/:id/sync-drive?folderId=<google-drive-folder-id>`
- Automatically creates sections for folders
- Creates documents for PDF files
- Maintains Google Drive IDs for future sync operations
- Supports incremental updates

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

### Railway Deployment

This project is configured for easy deployment on Railway using GitHub integration.

#### Prerequisites

1. **GitHub Repository**: Push your code to a GitHub repository
2. **Railway Account**: Sign up at [railway.app](https://railway.app)
3. **Database**: Railway PostgreSQL service
4. **Google Drive Credentials**: Service account credentials

#### Step-by-Step Railway Deployment

1. **Connect GitHub Repository**
   - Go to [railway.app](https://railway.app) and sign in
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your Melanie backend repository

2. **Add PostgreSQL Database**
   - In your Railway project dashboard, click "New Service"
   - Select "Database" → "PostgreSQL"
   - Railway will automatically create a database and provide connection details

3. **Configure Environment Variables**
   - Go to your service → "Variables" tab
   - Add the following environment variables:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
GOOGLE_CLIENT_ID=your-service-account-email@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----"
PORT=${{PORT}}
```

4. **Database Setup**
   - Railway will automatically run `prisma migrate deploy` during deployment
   - Ensure your `package.json` has the build script configured:

```json
{
  "scripts": {
    "build": "nest build",
    "start:prod": "node dist/main",
    "postinstall": "prisma generate && prisma migrate deploy"
  }
}
```

5. **Deploy**
   - Railway automatically deploys when you push to your main branch
   - Monitor the deployment in the Railway dashboard
   - Your app will be available at the provided Railway URL

#### Railway Configuration Files

Create a `railway.toml` file in your project root (optional):

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm run start:prod"
restartPolicyType = "on_failure"
```

### Alternative Deployment Options

#### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

#### Manual Production Setup

```bash
# Build the application
$ npm run build

# Start in production mode
$ npm run start:prod
```

## Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── dto/             # Data transfer objects
│   ├── guards/          # JWT and roles guards
│   └── strategies/      # Passport strategies
├── documents/           # Document management
├── sections/            # Section management
│   └── types/          # TypeScript interfaces
├── users/              # User management
├── roles/              # Role-based access control
├── google-drive/       # Google Drive integration
└── prisma/             # Database schema and migrations
```

## Key Technologies

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Passport
- **Authorization**: Role-based access control
- **External API**: Google Drive API integration
- **Testing**: Jest for unit and e2e tests
- **Documentation**: Swagger/OpenAPI

## Recent Enhancements

### Enhanced Sections Tree API

- **Performance Optimization**: Implemented atomic upsert operations for better database performance
- **Document Integration**: Added full document objects to the `/sections/tree` endpoint response
- **Type Safety**: Enhanced TypeScript interfaces for better development experience
- **Google Drive Sync**: Improved `driveId` handling for reliable Google Drive integration

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
