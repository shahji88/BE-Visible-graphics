import { PrismaClient } from '@prisma/client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaService {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async checkConnection(): Promise<boolean> {
    try {
      await this.prisma.$connect();
      return true;
    } catch (error) {
      console.error('Database connection error:', error.message);
      return false;
    }
  }

  get user() {
    return this.prisma.user;
  }
}
