/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async registerUser(
    email: string,
    password: string,
    authDetail: any,
  ): Promise<any> {
    const hashedPassword = await this.hashPassword(password);

    const payload = {
      email,
      password,
      connection: 'Username-Password-Authentication',
    };

    const user = await axios.post(
      `https://${process.env.AUTH0_DOMAIN}/api/v2/users`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authDetail?.accessToken}`,
        },
      },
    );

    await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        authId: user.data.user_id,
      },
    });

    return {
      success: true,
      message: 'User successfully registered. Confirmation email sent.',
    };
  }
}
