import { z } from 'zod';

const configSchema = z.object({
  port: z.coerce.number().min(1).max(65535).default(4000),
  databaseUrl: z.string().min(1),
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
});

export type AppConfig = z.infer<typeof configSchema>;

function loadConfig(): AppConfig {
  const rawConfig = {
    port: process.env.PORT,
    databaseUrl: process.env.DATABASE_URL,
    nodeEnv: process.env.NODE_ENV,
  };

  try {
    return configSchema.parse(rawConfig);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = (error as any).errors
        .map((err: any) => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      throw new Error(`Configuration validation failed: ${errorMessage}`);
    }
    throw error;
  }
}

export const config = loadConfig();
