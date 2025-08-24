import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

describe('DocumentsController', () => {
  let controller: DocumentsController;

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

  const mockDocumentsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findBySection: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [
        {
          provide: DocumentsService,
          useValue: mockDocumentsService,
        },
      ],
    }).compile();

    controller = module.get<DocumentsController>(DocumentsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a document', async () => {
      const createDocumentDto: CreateDocumentDto = {
        title: 'Test Document',
        url: 'https://example.com/document.pdf',
        sectionId: '550e8400-e29b-41d4-a716-446655440001',
      };

      mockDocumentsService.create.mockResolvedValue(mockDocument);

      const result = await controller.create(createDocumentDto);

      expect(mockDocumentsService.create).toHaveBeenCalledWith(
        createDocumentDto,
      );
      expect(result).toEqual(mockDocument);
    });
  });

  describe('findAll', () => {
    it('should return all documents when no sectionId provided', async () => {
      const documents = [mockDocument];
      mockDocumentsService.findAll.mockResolvedValue(documents);

      const result = await controller.findAll();

      expect(mockDocumentsService.findAll).toHaveBeenCalled();
      expect(result).toEqual(documents);
    });

    it('should return documents by section when sectionId provided', async () => {
      const documents = [mockDocument];
      const sectionId = '550e8400-e29b-41d4-a716-446655440001';
      mockDocumentsService.findBySection.mockResolvedValue(documents);

      const result = await controller.findAll(sectionId);

      expect(mockDocumentsService.findBySection).toHaveBeenCalledWith(
        sectionId,
      );
      expect(result).toEqual(documents);
    });
  });

  describe('findOne', () => {
    it('should return a document by id', async () => {
      mockDocumentsService.findOne.mockResolvedValue(mockDocument);

      const result = await controller.findOne(mockDocument.id);

      expect(mockDocumentsService.findOne).toHaveBeenCalledWith(
        mockDocument.id,
      );
      expect(result).toEqual(mockDocument);
    });
  });

  describe('update', () => {
    it('should update a document', async () => {
      const updateDocumentDto: UpdateDocumentDto = {
        title: 'Updated Document',
      };
      const updatedDocument = { ...mockDocument, ...updateDocumentDto };

      mockDocumentsService.update.mockResolvedValue(updatedDocument);

      const result = await controller.update(
        mockDocument.id,
        updateDocumentDto,
      );

      expect(mockDocumentsService.update).toHaveBeenCalledWith(
        mockDocument.id,
        updateDocumentDto,
      );
      expect(result).toEqual(updatedDocument);
    });
  });

  describe('remove', () => {
    it('should delete a document', async () => {
      mockDocumentsService.remove.mockResolvedValue(mockDocument);

      const result = await controller.remove(mockDocument.id);

      expect(mockDocumentsService.remove).toHaveBeenCalledWith(mockDocument.id);
      expect(result).toEqual(mockDocument);
    });
  });
});
