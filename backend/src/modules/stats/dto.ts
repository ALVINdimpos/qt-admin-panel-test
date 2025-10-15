import { z } from 'zod';

// Stats query parameters
export const StatsQueryDto = z.object({
  days: z.coerce.number().min(1).max(365).default(7),
});

export type StatsQueryDto = z.infer<typeof StatsQueryDto>;

// User stats response
export const UserStatsResponseDto = z.object({
  date: z.string(), // YYYY-MM-DD format
  count: z.number(),
});

export type UserStatsResponseDto = z.infer<typeof UserStatsResponseDto>;

// Stats response wrapper
export const StatsResponseDto = z.object({
  success: z.boolean(),
  data: z.array(UserStatsResponseDto),
  meta: z.object({
    days: z.number(),
    totalUsers: z.number(),
    period: z.object({
      startDate: z.string(),
      endDate: z.string(),
    }),
  }),
});

export type StatsResponseDto = z.infer<typeof StatsResponseDto>;
