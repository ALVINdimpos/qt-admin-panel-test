export const ENV = {
  API_URL: import.meta.env.VITE_API_URL as string,
} as const;

if (!ENV.API_URL) {
  throw new Error('VITE_API_URL environment variable is required');
}
