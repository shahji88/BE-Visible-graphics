/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { NodemailerService } from 'src/nodemailer/nodemailer.service';
@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly nodemailer: NodemailerService,
  ) {}

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

  async login(payload) {
    const tokenResponse = await axios.post(
      `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
      payload,
    );

    const idToken = tokenResponse.data.id_token;
    const decoded: any = jwt.decode(idToken);

    if (decoded.email_verified === false) {
      throw new BadRequestException('Sorry, your email is not verified yet!');
    }

    return {
      data: {
        access_token: tokenResponse?.data?.access_token,
        refresh_token: tokenResponse?.data?.refresh_token,
        expires_in: tokenResponse?.data?.expires_in,
        email: decoded?.email,
        authId: decoded?.sub,
      },
    };
  }

  async forgotPassword(email: string): Promise<any> {
    await this.prisma.passwordReset.deleteMany({
      where: {
        email: email,
      },
    });

    const token = uuidv4();
    const expiresAt = new Date(
      new Date().getTime() +
        parseInt(process.env.RESET_PASSWORD_TOKEN_EXIPIRY_HOUR) *
          60 *
          60 *
          1000,
    );
    await this.prisma.passwordReset.create({
      data: {
        email,
        token,
        expiresAt,
      },
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?email=${email}&token=${token}`;
    await this.nodemailer.sendMail({
      from: process.env.SMTP_USERNAME,
      to: email,
      subject: 'Password Reset Request',
      html: `Please use the following link to reset your password: ${resetLink}`,
    });

    return {
      message: 'Password reset link send in your mail successfully.',
    };
  }

  async resetPassword(
    token: string,
    email: string,
    newPassword: string,
    auth0,
  ): Promise<any> {
    const passwordResetEntry = await this.prisma.passwordReset.findUnique({
      where: { token, email },
    });

    if (!passwordResetEntry || passwordResetEntry.expiresAt < new Date()) {
      throw new BadRequestException(
        'Sorry, you have input Invalid or expired token',
      );
    }

    const hashedPassword = await this.hashPassword(newPassword);

    await this.prisma.user.update({
      where: {
        email: email,
      },
      data: {
        password: hashedPassword,
      },
    });

    await this.prisma.passwordReset.delete({
      where: { token, email },
    });

    const userByEmail = await axios.get(
      `https://${process.env.AUTH0_DOMAIN}/api/v2/users-by-email`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth0?.accessToken}`,
        },
        params: {
          email: email,
        },
      },
    );

    const filteredUsers = userByEmail?.data.find((user) =>
      user.user_id?.includes('auth0'),
    );

    const userSub = filteredUsers?.user_id;

    const response = await axios.patch(
      `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${userSub}`,
      {
        password: newPassword,
        connection: 'Username-Password-Authentication',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth0?.accessToken}`,
        },
      },
    );

    return response;
  }
}
