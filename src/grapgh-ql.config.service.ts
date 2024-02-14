import { GraphqlConfig } from './common/configs/config.interface'
import { ConfigService } from '@nestjs/config'
import { ApolloDriverConfig } from '@nestjs/apollo'
import { Injectable } from '@nestjs/common'
import { GqlOptionsFactory } from '@nestjs/graphql'
@Injectable()
export class GqlConfigService implements GqlOptionsFactory {
  constructor(private configService: ConfigService) {}
  createGqlOptions(): ApolloDriverConfig {
    const graphqlConfig = this.configService.get<GraphqlConfig>('graphql')
    return {
      // schema options
      autoSchemaFile: './src/schema.graphql',
      //   sortSchema: graphqlConfig.sortSchema,
      buildSchemaOptions: {
        numberScalarMode: 'integer',
      },
      formatError: (error) => {
        const originalError = error?.extensions?.originalError as any

        const statusCode = originalError?.statusCode || 500

        return {
          message: originalError?.message || error.message,
          statusCode: statusCode,
        }
      },
    }
  }
}
