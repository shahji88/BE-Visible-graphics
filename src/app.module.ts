import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphqlModule } from './graphql/graphql.module';
import { AdminModule } from './admin/admin.module';
import { PrismaService } from './prisma/prisma.service';
import { UserModule } from './user/user.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'


@Module({
  imports: [GraphqlModule, AdminModule, UserModule,
    GraphQLModule.forRoot({
      autoSchemaFile: true,
      driver: ApolloDriver
    }),
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
