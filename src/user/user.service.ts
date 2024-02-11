import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(email: string, password: string, role: string, status: string) {
    return this.prismaService.createUser(email, password, role, status);
  }

  async findUserByEmail(email: string) {
    return this.prismaService.findUserByEmail(email);
  }
}
