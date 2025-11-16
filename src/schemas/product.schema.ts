import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(255).optional(),
  price: z.preprocess((val) => Number(val), z.number().min(0)),
  stock: z.preprocess((val) => Number(val), z.number().int().min(1)),
  categoryId: z.uuid().optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(255).optional(),
  price: z.preprocess((val) => Number(val), z.number().min(0)).optional(),
  stock: z.preprocess((val) => Number(val), z.number().int().min(1)).optional(),
  categoryId: z.uuid().optional(),
});

export const productByIdSchema = z.object({
  id: z.uuid(),
});

export const getAllProductsSchema = z.object({
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

export const getProductsByCategorySchema = getAllProductsSchema.extend({
  categoryId: z.string().uuid(),
});

export type ProductInput = z.infer<typeof createProductSchema>;
export type GetAllProductsInput = z.infer<typeof getAllProductsSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type GetProductsByCategoryInput = z.infer<
  typeof getProductsByCategorySchema
>;
