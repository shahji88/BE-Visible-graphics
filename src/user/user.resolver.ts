/* eslint-disable prettier/prettier */
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UserService } from './user.service';
import { AuthProvider } from 'src/common/auth0ApiToken/auth.provider';
import axios from 'axios';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { RegisterInput } from './dto/register.input';
import { RegisterResponse } from './dto/register.response';

@Resolver('User')
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly authProvider: AuthProvider,
  ) {}

  @Mutation(() => RegisterResponse)
  async registerUser(@Args('data') registerInput: RegisterInput) {
    try {
      const { email, password } = registerInput;

      const auth0 = await this.authProvider.getManagementApiToken();

      const response = await axios.get(
        `https://${process.env.AUTH0_DOMAIN}/api/v2/users-by-email`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth0?.accessToken}`,
          },
          params: {
            email: email.toLowerCase(),
          },
        },
      );
      if (response?.data?.length > 0) {
        throw new BadRequestException(`Email ${email} already exist.`);
      }
      const user = await this.userService.registerUser(email, password, auth0);
      return { success: true, message: user.message };
    } catch (error) {
      throw new InternalServerErrorException(
        error?.response?.data?.error_description ||
          error?.response?.data?.message ||
          error.message ||
          'Internal server error.',
      );
    }
  }
}
