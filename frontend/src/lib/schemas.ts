import { z } from 'zod';

export const adFormSchema = z.object({
  category: z.enum(['auto', 'real_estate', 'electronics']),
  title: z.string().min(1, 'Title is required'),
  price: z.number().min(0, 'Price must be non-negative'),
  description: z.string(),
  params: z.record(z.string(), z.union([z.string(), z.number()])),
});

export type AdFormData = z.infer<typeof adFormSchema>;