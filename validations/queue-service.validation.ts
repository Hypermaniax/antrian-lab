import { z } from 'zod';
import { codeSchema, prefixSchema, nameSchema } from './common.validation';

export const queueServiceCreateSchema = z.object({
  code: codeSchema,
  name: nameSchema,
  prefix: prefixSchema,
  description: z
    .string()
    .trim()
    .max(1000, 'Description max 1000 karakter')
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),
});

export const queueServiceUpdateSchema = z
  .object({
    name: nameSchema.optional(),
    prefix: prefixSchema.optional(),
    description: z.string().trim().max(1000).optional().nullable().transform((v) => (v && v.length > 0 ? v : null)),
  })
  .refine((d) => Object.keys(d).length > 0, { message: 'Minimal satu field harus diisi' });

export type QueueServiceCreateInput = z.infer<typeof queueServiceCreateSchema>;
export type QueueServiceUpdateInput = z.infer<typeof queueServiceUpdateSchema>;
