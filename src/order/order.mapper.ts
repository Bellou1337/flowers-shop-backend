import { ProductMapper } from "../product/product.mapper";
import { UserMapper } from "../user/user.mapper";
import type {
  Order,
  OrderItem,
  Product,
  User,
} from "../generated/prisma/client";

export type OrderItemResponse = OrderItem & {
  product: ReturnType<typeof ProductMapper.toResponse>;
};

export type OrderResponse = Order & {
  orderItems: OrderItemResponse[];
  user?: ReturnType<typeof UserMapper.toResponse> | undefined;
};

export class OrderMapper {
  static toResponse(
    order: Order & {
      orderItems: (OrderItem & { product: Product })[];
      user?: User;
    }
  ): OrderResponse {
    return {
      ...order,
      orderItems: order.orderItems.map((item) => ({
        ...item,
        product: ProductMapper.toResponse(item.product),
      })),
      user: order.user ? UserMapper.toResponse(order.user) : undefined,
    };
  }

  static toArrayResponse(
    orders: (Order & {
      orderItems: (OrderItem & { product: Product })[];
      user?: User;
    })[]
  ): OrderResponse[] {
    return orders.map((order) => this.toResponse(order));
  }
}
