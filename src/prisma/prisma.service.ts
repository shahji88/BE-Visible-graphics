import { PrismaClient } from '@prisma/client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaService {
  constructor(private readonly prisma: PrismaClient) {}

  async createUser(email: string, password: string, role: string, status: string) {
    return this.prisma.user.create({
      data: {
        email,
        password,
        role,
        status,
      },
    });
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }
}
