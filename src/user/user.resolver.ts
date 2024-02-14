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
import { LoginInput } from './dto/login.input';
import { LoginResponse } from './dto/login.response';
import { MessageResponse } from './dto/messsage.response';
import { PasswordResetInput } from './dto/password-reset.input';

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

  @Mutation(() => LoginResponse)
  async login(@Args('data') loginInput: LoginInput) {
    try {
      const data = await this.userService.login({
        grant_type: 'password',
        username: loginInput.email,
        password: loginInput.password,
        audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
        scope: 'openid profile email offline_access',
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_SECRET,
      });

      return {
        success: true,
        access_token: data?.data?.access_token,
        refresh_token: data?.data?.refresh_token,
        expires_in: data?.data?.expires_in,
        authId: data?.data?.authId,
        email: data?.data?.email,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error?.response?.data?.error_description ||
          error?.response?.data?.message ||
          error.message ||
          'Internal Server Error.',
      );
    }
  }

  @Mutation(() => MessageResponse)
  async forgotPassword(@Args('email') email: string) {
    try {
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

      if (response?.data?.length === 0) {
        throw new BadRequestException(`Email ${email} does not exist.`);
      }
      const user = await this.userService.forgotPassword(email);
      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        error?.response?.data?.error_description ||
          error?.response?.data?.message ||
          error.message ||
          'Internal server error.',
      );
    }
  }

  @Mutation(() => MessageResponse)
  async resetPassword(@Args('data') data: PasswordResetInput) {
    const auth0 = await this.authProvider.getManagementApiToken();

    const { token, email, newPassword } = data;

    try {
      await this.userService.resetPassword(token, email, newPassword, auth0);

      return {
        message: 'Password reset successfully.',
      };
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
