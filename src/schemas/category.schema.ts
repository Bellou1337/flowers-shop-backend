import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(255).optional(),
});

export const categoryByIdSchema = z.object({
  id: z.uuid(),
});

export const getAllCategoriesSchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => Number(val) || 1),
  limit: z
    .string()
    .optional()
    .default("10")
    .transform((val) => Number(val) || 10),
  order: z.enum(["asc", "desc"]).optional().default("asc"),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(255).optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type GetCategoryByIdInput = z.infer<typeof categoryByIdSchema>;
export type GetAllCategoriesInput = z.infer<typeof getAllCategoriesSchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
