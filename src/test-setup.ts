// src/test-setup.ts
// This file is loaded before each test and can be used to configure the test environment
// Prevents real database connections in unit tests

// Suppress Prisma warnings about DATABASE_URL in tests
process.env.PRISMA_SKIP_ENGINE_CHECK = 'true';

// Set a shorter timeout for database operations in tests
jest.setTimeout(10000);
