import { z } from 'zod';
import { QUEUE_STAGE } from '@/lib/constants';
import { codeSchema, nameSchema } from './common.validation';

const stageEnum = z.enum(
  [QUEUE_STAGE.REGISTRATION, QUEUE_STAGE.BLOOD_COLLECTION, QUEUE_STAGE.RESULT_PICKUP] as const,
  { message: `Stage harus salah satu: ${Object.values(QUEUE_STAGE).join(', ')}` }
);

export const stationCreateSchema = z.object({
  queueServiceId: z.string().uuid('Service ID harus UUID'),
  name: nameSchema,
  code: codeSchema,
  stage: stageEnum,
});

export const stationUpdateSchema = z
  .object({
    name: nameSchema.optional(),
    stage: stageEnum.optional(),
    queueServiceId: z.string().uuid().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: 'Minimal satu field harus diisi' });

export type StationCreateInput = z.infer<typeof stationCreateSchema>;
export type StationUpdateInput = z.infer<typeof stationUpdateSchema>;
