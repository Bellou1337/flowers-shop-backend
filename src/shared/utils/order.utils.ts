import type { OrderStatus } from "../../generated/prisma/enums";
import type { Product, CartItem } from "../../generated/prisma/client";
import { ORDER_STATUSES } from "../constants/order.constants";

export const isOrderCancellable = (status: OrderStatus): boolean =>
  status === ORDER_STATUSES.PENDING || status === ORDER_STATUSES.CONFIRMED;

export const calculateOrderTotal = (
  items: Array<{ price: number; quantity: number }>
): number =>
  items.reduce((total, item) => total + item.price * item.quantity, 0);

export const validateStock = (
  items: Array<CartItem & { product: Product }>
): void => {
  for (const item of items) {
    if (item.product.stock < item.quantity) {
      throw new Error(
        `Not enough stock for product: ${item.product.name}. Available: ${item.product.stock}, requested: ${item.quantity}`
      );
    }
  }
};
