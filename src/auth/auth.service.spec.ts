import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto';

jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: jest.Mocked<PrismaService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashedPassword',
    createdAt: new Date(),
    updatedAt: new Date(),
    roles: [
      {
        role: {
          name: 'USER',
        },
      },
    ],
  } as const;

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'john@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should register a new user successfully', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue('hashedPassword' as never);
      jest.spyOn(prismaService.user, 'create').mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'sign').mockReturnValue('jwt-token');

      const result = await service.register(registerDto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(registerDto.password, 12);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          name: `${registerDto.firstName} ${registerDto.lastName}`,
          email: registerDto.email,
          password: 'hashedPassword',
        },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });
      expect(result).toEqual({
        access_token: 'jwt-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: 'John',
          lastName: 'Doe',
          role: 'USER',
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.createdAt,
        },
      });
    });

    it('should throw ConflictException if user already exists', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'john@example.com',
      password: 'password123',
    };

    it('should login user successfully', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      jest.spyOn(jwtService, 'sign').mockReturnValue('jwt-token');

      const result = await service.login(loginDto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
        include: { roles: { include: { role: true } } },
      });
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(result).toEqual({
        access_token: 'jwt-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: 'John',
          lastName: 'Doe',
          role: 'USER',
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.createdAt,
        },
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateUser', () => {
    it('should return user profile for valid user', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await service.validateUser('1');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { roles: { include: { role: true } } },
      });
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        firstName: 'John',
        lastName: 'Doe',
        role: 'USER',
        roles: ['USER'],
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.createdAt,
      });
    });

    it('should throw UnauthorizedException for invalid user', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(service.validateUser('invalid-id')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const validateUserSpy = jest
        .spyOn(service, 'validateUser')
        .mockResolvedValue({
          id: mockUser.id,
          email: mockUser.email,
          firstName: 'John',
          lastName: 'Doe',
          role: 'USER',
          roles: ['USER'],
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.createdAt,
        });

      const result = await service.getProfile('1');

      expect(validateUserSpy).toHaveBeenCalledWith('1');
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        firstName: 'John',
        lastName: 'Doe',
        role: 'USER',
        roles: ['USER'],
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.createdAt,
      });
    });
  });
});
