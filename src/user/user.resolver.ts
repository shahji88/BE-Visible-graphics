import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { PrismaClient, User } from '@prisma/client';

import { UserService } from './user.service';

@Resolver('User')
export class UserResolver {
  constructor(
    private readonly prisma: PrismaClient, // Inject PrismaClient
    private readonly userService: UserService
  ) {}

  @Query('userByEmail')
  async userByEmail(@Args('email') email: string): Promise<User | null> {
    // Use PrismaClient to fetch user by email
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  @Mutation('createUser')
  async createUser(
    @Args('email') email: string,
    @Args('password') password: string,
    @Args('role') role: string,
    @Args('status') status: string,
  ): Promise<User> {
    // Create user using PrismaClient
    return this.prisma.user.create({
      data: {
        email,
        password,
        role,
        status,
      },
    });
  }
}
