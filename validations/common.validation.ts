import { z } from 'zod';

export const codeSchema = z
  .string()
  .trim()
  .min(1, 'Code wajib diisi')
  .max(50, 'Code max 50 karakter')
  .transform((v) => v.toUpperCase());

export const prefixSchema = z
  .string()
  .trim()
  .min(1, 'Prefix wajib diisi')
  .max(5, 'Prefix max 5 karakter')
  .transform((v) => v.toUpperCase());

export const nameSchema = z.string().trim().min(1, 'Name wajib diisi').max(255, 'Name max 255 karakter');

export function formatZodError(error: z.ZodError): string {
  const first = error.issues[0];
  return first ? first.message : 'Validasi gagal';
}
