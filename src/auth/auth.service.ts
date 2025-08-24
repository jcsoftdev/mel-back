import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, firstName, lastName } = registerDto;

    // Check if user already exists
    const existingUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user with name from firstName and lastName
    const name =
      [firstName, lastName].filter(Boolean).join(' ') || email.split('@')[0];

    try {
      const user = await this.prismaService.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
        },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      // Generate JWT token
      const payload = {
        sub: user.id,
        email: user.email,
        roles: user.roles.map((userRole) => userRole.role.name),
      };
      const access_token = this.jwtService.sign(payload);

      return {
        access_token,
        user: {
          id: user.id,
          email: user.email,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          role: user.roles.length > 0 ? user.roles[0].role.name : 'USER',
          createdAt: user.createdAt,
          updatedAt: user.createdAt, // Since there's no updatedAt in schema
        },
      };
    } catch {
      throw new BadRequestException('Failed to create user');
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user with roles
    const user = await this.prismaService.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map((userRole) => userRole.role.name),
    };
    const access_token = this.jwtService.sign(payload);

    // Extract firstName and lastName from name
    const nameParts = user.name.split(' ');
    const firstName = nameParts[0] || null;
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : null;

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        role: user.roles.length > 0 ? user.roles[0].role.name : 'USER',
        createdAt: user.createdAt,
        updatedAt: user.createdAt, // Since there's no updatedAt in schema
      },
    };
  }

  async validateUser(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Extract firstName and lastName from name
    const nameParts = user.name.split(' ');
    const firstName = nameParts[0] || undefined;
    const lastName =
      nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined;

    return {
      id: user.id,
      email: user.email,
      firstName,
      lastName,
      role: user.roles.length > 0 ? user.roles[0].role.name : 'USER',
      roles: user.roles.map((userRole) => userRole.role.name),
      createdAt: user.createdAt,
      updatedAt: user.createdAt, // Since there's no updatedAt in schema
    };
  }

  async getProfile(userId: string) {
    return this.validateUser(userId);
  }
}
