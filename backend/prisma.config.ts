import { defineConfig } from 'prisma/config';
import { PrismaPg } from '@prisma/adapter-pg';

export default defineConfig({
  schema: './prisma/schema.prisma',
  migrate: {
    adapter(env) {
      return new PrismaPg({ connectionString: env.DATABASE_URL as string });
    },
  },
});
