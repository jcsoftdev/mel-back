import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from './documents.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { NotFoundException } from '@nestjs/common';

describe('DocumentsService', () => {
  let service: DocumentsService;

  const mockDocument = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Test Document',
    url: 'https://example.com/document.pdf',
    sectionId: '550e8400-e29b-41d4-a716-446655440001',
    createdAt: new Date('2023-01-01T00:00:00.000Z'),
    section: {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Test Section',
    },
  };

  const mockPrismaService = {
    document: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a document', async () => {
      const createDocumentDto: CreateDocumentDto = {
        title: 'Test Document',
        url: 'https://example.com/document.pdf',
        sectionId: '550e8400-e29b-41d4-a716-446655440001',
      };

      mockPrismaService.document.create.mockResolvedValue(mockDocument);

      const result = await service.create(createDocumentDto);

      expect(mockPrismaService.document.create).toHaveBeenCalledWith({
        data: createDocumentDto,
        include: {
          section: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      expect(result).toEqual(mockDocument);
    });
  });

  describe('findAll', () => {
    it('should return all documents', async () => {
      const documents = [mockDocument];
      mockPrismaService.document.findMany.mockResolvedValue(documents);

      const result = await service.findAll();

      expect(mockPrismaService.document.findMany).toHaveBeenCalledWith({
        include: {
          section: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toEqual(documents);
    });
  });

  describe('findOne', () => {
    it('should return a document by id', async () => {
      mockPrismaService.document.findUnique.mockResolvedValue(mockDocument);

      const result = await service.findOne(mockDocument.id);

      expect(mockPrismaService.document.findUnique).toHaveBeenCalledWith({
        where: { id: mockDocument.id },
        include: {
          section: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      expect(result).toEqual(mockDocument);
    });

    it('should throw NotFoundException when document not found', async () => {
      mockPrismaService.document.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a document', async () => {
      const updateDocumentDto: UpdateDocumentDto = {
        title: 'Updated Document',
      };
      const updatedDocument = { ...mockDocument, ...updateDocumentDto };

      mockPrismaService.document.findUnique.mockResolvedValue(mockDocument);
      mockPrismaService.document.update.mockResolvedValue(updatedDocument);

      const result = await service.update(mockDocument.id, updateDocumentDto);

      expect(mockPrismaService.document.findUnique).toHaveBeenCalledWith({
        where: { id: mockDocument.id },
        include: {
          section: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      expect(mockPrismaService.document.update).toHaveBeenCalledWith({
        where: { id: mockDocument.id },
        data: updateDocumentDto,
        include: {
          section: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      expect(result).toEqual(updatedDocument);
    });

    it('should throw NotFoundException when document not found', async () => {
      mockPrismaService.document.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', { title: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a document', async () => {
      mockPrismaService.document.findUnique.mockResolvedValue(mockDocument);
      mockPrismaService.document.delete.mockResolvedValue(mockDocument);

      const result = await service.remove(mockDocument.id);

      expect(mockPrismaService.document.findUnique).toHaveBeenCalledWith({
        where: { id: mockDocument.id },
        include: {
          section: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      expect(mockPrismaService.document.delete).toHaveBeenCalledWith({
        where: { id: mockDocument.id },
      });
      expect(result).toEqual(mockDocument);
    });

    it('should throw NotFoundException when document not found', async () => {
      mockPrismaService.document.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findBySection', () => {
    it('should return documents by section id', async () => {
      const documents = [mockDocument];
      mockPrismaService.document.findMany.mockResolvedValue(documents);

      const result = await service.findBySection(mockDocument.sectionId);

      expect(mockPrismaService.document.findMany).toHaveBeenCalledWith({
        where: { sectionId: mockDocument.sectionId },
        include: {
          section: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toEqual(documents);
    });
  });
});
