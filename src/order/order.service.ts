import { prisma } from "../database/prisma-client";
import type {
  Order,
  OrderItem,
  Product,
  User,
  OrderStatus,
} from "../generated/prisma/client";
import createError from "http-errors";
import { ORDER_STATUSES } from "../shared/constants/order.constants";
import {
  isOrderCancellable,
  calculateOrderTotal,
  validateStock,
} from "../shared/utils/order.utils";

export type CreateOrderInput = {
  userId: string;
  deliveryAddress: string;
  contactPhone: string;
  comment?: string;
};

export type UpdateOrderStatusInput = {
  id: string;
  status: OrderStatus;
};

export type OrderPaginationInput = {
  skip: number;
  take: number;
  status?: OrderStatus;
};

export class OrderService {
  async findById(id: string): Promise<
    | (Order & {
        orderItems: (OrderItem & { product: Product })[];
      })
    | null
  > {
    return await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async findByIdWithUser(id: string): Promise<
    | (Order & {
        orderItems: (OrderItem & { product: Product })[];
        user: User;
      })
    | null
  > {
    return await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    });
  }

  async findByUserId(
    userId: string,
    pagination: OrderPaginationInput
  ): Promise<
    (Order & {
      orderItems: (OrderItem & { product: Product })[];
    })[]
  > {
    const where: any = { userId };
    if (pagination.status) where.status = pagination.status;

    return await prisma.order.findMany({
      where,
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
    });
  }

  async findAll(pagination: OrderPaginationInput): Promise<
    (Order & {
      orderItems: (OrderItem & { product: Product })[];
      user: User;
    })[]
  > {
    const where: any = {};
    if (pagination.status) where.status = pagination.status;

    return await prisma.order.findMany({
      where,
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        user: true,
      },
      orderBy: { createdAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
    });
  }

  async createOrderFromCart(data: CreateOrderInput): Promise<string> {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: data.userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      throw createError(400, "Cart is empty");
    }

    validateStock(cartItems);

    const totalPrice = calculateOrderTotal(
      cartItems.map((item) => ({
        price: item.product.price,
        quantity: item.quantity,
      }))
    );

    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: data.userId,
          status: ORDER_STATUSES.PENDING,
          totalPrice,
          deliveryAddress: data.deliveryAddress,
          contactPhone: data.contactPhone,
          comment: data.comment || null,
        },
      });

      await tx.orderItem.createMany({
        data: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
          orderId: order.id,
        })),
      });

      for (const cartItem of cartItems) {
        await tx.product.update({
          where: { id: cartItem.productId },
          data: {
            stock: { decrement: cartItem.quantity },
          },
        });
      }

      await tx.cartItem.deleteMany({
        where: { userId: data.userId },
      });

      return order.id;
    });
  }

  async updateOrderStatus(data: UpdateOrderStatusInput): Promise<Order> {
    const order = await this.findById(data.id);
    if (!order) throw createError(404, "Order not found");

    return await prisma.order.update({
      where: { id: data.id },
      data: { status: data.status },
    });
  }

  async cancelOrder(id: string, userId?: string): Promise<string> {
    const order = await this.findById(id);
    if (!order) throw createError(404, "Order not found");

    if (userId && order.userId !== userId) {
      throw createError(403, "Access denied");
    }

    if (!isOrderCancellable(order.status)) {
      throw createError(
        400,
        `Cannot cancel order with status: ${order.status}`
      );
    }

    return await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id },
        data: { status: ORDER_STATUSES.CANCELLED },
      });

      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      return id;
    });
  }

  async countUserOrders(userId: string, status?: OrderStatus): Promise<number> {
    const where: any = { userId };
    if (status) where.status = status;
    return await prisma.order.count({ where });
  }

  async countAllOrders(status?: OrderStatus): Promise<number> {
    const where: any = {};
    if (status) where.status = status;
    return await prisma.order.count({ where });
  }

  async userOwnsOrder(orderId: string, userId: string): Promise<boolean> {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
    });
    return !!order;
  }
}
