import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class LoginResponse {
  @Field()
  access_token: string;

  @Field()
  refresh_token: string;

  @Field()
  expires_in: string;

  @Field()
  email: string;

  @Field()
  authId: string;
}
