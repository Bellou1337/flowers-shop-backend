import { z } from "zod";
import { ORDER_STATUSES } from "../shared/constants/order.constants";

export const orderStatusSchema = z.enum(ORDER_STATUSES);

export const createOrderSchema = z.object({
  deliveryAddress: z
    .string()
    .min(1, "Delivery address is required")
    .max(500, "Delivery address is too long"),
  contactPhone: z
    .string()
    .min(5, "Contact phone is required")
    .max(30, "Contact phone is too long"),
  comment: z.string().max(1000, "Comment is too long").optional(),
});

export const updateOrderStatusSchema = z.object({
  status: orderStatusSchema,
});

export const orderParamsSchema = z.object({
  id: z.uuid("Invalid order ID"),
});

export const orderQuerySchema = z.object({
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
  status: orderStatusSchema.optional(),
});

export const cancelOrderSchema = z.object({
  reason: z.string().max(1000, "Cancellation reason is too long").optional(),
});

export const userOrderParamsSchema = z.object({
  id: z.uuid("Invalid order ID"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type OrderQueryInput = z.infer<typeof orderQuerySchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
export type OrderStatusType = z.infer<typeof orderStatusSchema>;
