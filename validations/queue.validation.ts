import { z } from 'zod';

export const queueCreateSchema = z.object({
  queueServiceId: z.string().uuid('Service ID harus UUID'),
  patientName: z.string().trim().max(255).optional().nullable(),
  patientId: z.string().trim().max(255).optional().nullable(),
});

export type QueueCreateInput = z.infer<typeof queueCreateSchema>;
