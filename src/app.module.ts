import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { UserModule } from './user/user.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path'
import appConfig from './app.config'
import { GqlConfigService } from './grapgh-ql.config.service'
import { AppResolver } from './app.resolver';

const envFilePath: string = join('src', 'configs', `.env`)

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath, isGlobal: true, load: [appConfig] }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useClass: GqlConfigService,
    }),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppResolver, AppService, PrismaService],
})
export class AppModule {}
