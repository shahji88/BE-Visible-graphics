/* eslint-disable prettier/prettier */
// user.module.ts
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [],
  controllers: [],
  providers: [PrismaService, UserService, UserResolver],
})
export class UserModule {}
