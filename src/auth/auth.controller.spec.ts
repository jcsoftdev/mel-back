import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterDto,
  AuthResponseDto,
  ProfileResponseDto,
} from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockAuthResponse: AuthResponseDto = {
    access_token: 'jwt-token',
    user: {
      id: '1',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  const mockProfileResponse: ProfileResponseDto = {
    id: '1',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'USER',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      getProfile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'john@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should register a new user', async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const registerSpy = authService.register as jest.Mock;
      registerSpy.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'john@example.com',
      password: 'password123',
    };

    it('should login a user', async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const loginSpy = authService.login as jest.Mock;
      loginSpy.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe('getProfile', () => {
    const mockRequest = {
      user: {
        id: '1',
      },
    };

    it('should return user profile', async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const getProfileSpy = authService.getProfile as jest.Mock;
      getProfileSpy.mockResolvedValue(mockProfileResponse);

      const result = await controller.getProfile(mockRequest);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authService.getProfile).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockProfileResponse);
    });
  });
});
