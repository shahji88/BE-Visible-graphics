
import { ConfigFactory } from '@nestjs/config';

const appConfig: ConfigFactory = () => ({
  port: process.env.PORT || 3000,
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/mydb',
  },
});

export default appConfig;
