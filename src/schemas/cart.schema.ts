import { z } from "zod";

export const cartItemSchema = z.object({
  productId: z.uuid("Invalid product ID"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

export const cartItemParamsSchema = z.object({
  id: z.uuid("Invalid cart item ID"),
});

export const cartItemProductParamsSchema = z.object({
  productId: z.uuid("Invalid product ID"),
});

export type CartItemInput = z.infer<typeof cartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
