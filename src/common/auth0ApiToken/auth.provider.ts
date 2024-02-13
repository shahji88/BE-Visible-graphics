/* eslint-disable prettier/prettier */
// auth.provider.ts

import { Injectable } from '@nestjs/common'
import axios from 'axios'

@Injectable()
export class AuthProvider {
  private MANAGEMENT_API_TOKEN: string = '' // Initialize with an empty string
  private TOKEN_EXPIRATION: number = 0 // Initialize with 0

  async getManagementApiToken() {
    if (Date.now() >= this.TOKEN_EXPIRATION) {
      const response = await axios.post(
        `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
        {
          grant_type: 'client_credentials',
          client_id: process.env.AUTH0_CLIENT_ID,
          client_secret: process.env.AUTH0_SECRET,
          audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
        },
        { headers: { 'content-type': 'application/x-www-form-urlencoded' } },
      )

      this.MANAGEMENT_API_TOKEN = response.data.access_token
      this.TOKEN_EXPIRATION = Date.now() + response.data.expires_in * 1000

      return {
        accessToken: this.MANAGEMENT_API_TOKEN,
        expireIn: this.TOKEN_EXPIRATION,
      }
    } else {
      return {
        accessToken: this.MANAGEMENT_API_TOKEN,
        expireIn: this.TOKEN_EXPIRATION,
      }
    }
  }
}
