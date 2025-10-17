// src/common/test/test-utils.ts
// Shared test utilities and mocks for unit tests

/**
 * Create a mock PrismaService for unit tests
 */
export const createMockPrismaService = () => ({
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  form: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  formField: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  formSubmission: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  formSubmissionField: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  fileMetadata: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  document: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  section: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  role: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn(),
  $disconnect: jest.fn(),
});

/**
 * Create a mock RoleAccessService for unit tests
 */
export const createMockRoleAccessService = () => ({
  getUserAccessibleDocumentIds: jest.fn().mockResolvedValue([]),
  getUserAccessibleSectionIds: jest.fn().mockResolvedValue([]),
});

/**
 * Create a mock GoogleDriveService for unit tests
 */
export const createMockGoogleDriveService = () => ({
  uploadFile: jest.fn().mockResolvedValue({
    id: 'mock-drive-id',
    name: 'mock-file',
  }),
  deleteFile: jest.fn().mockResolvedValue(true),
  getFileAsBase64: jest.fn().mockResolvedValue('base64content'),
  getDirectoryTree: jest.fn().mockResolvedValue([]),
  createFolder: jest.fn().mockResolvedValue({ id: 'mock-folder-id' }),
  getMediaStream: jest.fn().mockResolvedValue({
    data: Buffer.from('mock-data'),
    headers: { 'content-type': 'application/pdf' },
  }),
});

/**
 * Create a mock ConfigService for unit tests
 */
export const createMockConfigService = () => ({
  googleDrive: {
    clientId: 'mock-client-id',
    privateKey: 'mock-private-key',
  },
  database: {
    url: 'postgresql://mock:mock@localhost:5432/mock',
  },
  jwt: {
    secret: 'mock-secret',
    expiresIn: '24h',
  },
});

/**
 * Create a mock UsersService for unit tests
 */
export const createMockUsersService = () => ({
  findAll: jest.fn().mockResolvedValue([]),
  findOne: jest.fn().mockResolvedValue(null),
  create: jest.fn().mockResolvedValue({}),
  update: jest.fn().mockResolvedValue({}),
  remove: jest.fn().mockResolvedValue({}),
});

/**
 * Create a mock FormValidationService for unit tests
 */
export const createMockFormValidationService = () => ({
  validateFieldValue: jest.fn(),
  validateFormSubmission: jest.fn(),
  sanitizeValue: jest.fn(),
});
