import { prisma } from "../database/prisma-client";
import type { CartItem, Product } from "../generated/prisma/client";
import createError from "http-errors";

export type CartItemInput = {
  userId: string;
  productId: string;
  quantity: number;
};

export type UpdateCartItemInput = {
  id: string;
  quantity: number;
};

export class CartService {
  async findByUserAndProduct(
    userId: string,
    productId: string
  ): Promise<CartItem | null> {
    return await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
  }

  async findById(
    id: string
  ): Promise<(CartItem & { product: Product }) | null> {
    return await prisma.cartItem.findUnique({
      where: {
        id,
      },
      include: {
        product: true,
      },
    });
  }

  async findByUserId(
    userId: string
  ): Promise<(CartItem & { product: Product })[]> {
    return await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async createCartItem(
    data: CartItemInput
  ): Promise<CartItem & { product: Product }> {
    const product = await prisma.product.findUnique({
      where: {
        id: data.productId,
      },
    });

    if (!product) {
      throw createError(404, "Product not found");
    }

    if (product.stock < data.quantity) {
      throw createError(400, "Not enough stock available");
    }

    const existingCartItem = await this.findByUserAndProduct(
      data.userId,
      data.productId
    );

    if (existingCartItem) {
      return await this.updateCartItem({
        id: existingCartItem.id,
        quantity: existingCartItem.quantity + data.quantity,
      });
    }

    const cartItem = await prisma.cartItem.create({
      data: {
        userId: data.userId,
        productId: data.productId,
        quantity: data.quantity,
      },
      include: {
        product: true,
      },
    });

    return cartItem;
  }

  async updateCartItem(
    data: UpdateCartItemInput
  ): Promise<CartItem & { product: Product }> {
    const cartItem = await prisma.cartItem.findUnique({
      where: {
        id: data.id,
      },
      include: {
        product: true,
      },
    });

    if (!cartItem) {
      throw createError(404, "Cart item not found");
    }

    if (cartItem.product.stock < data.quantity) {
      throw createError(400, "Not enough stock available");
    }

    return await prisma.cartItem.update({
      where: {
        id: data.id,
      },
      data: {
        quantity: data.quantity,
      },
      include: {
        product: true,
      },
    });
  }

  async deleteCartItem(id: string): Promise<void> {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
    });

    if (!cartItem) {
      throw createError(404, "Cart item not found");
    }

    await prisma.cartItem.delete({
      where: {
        id,
      },
    });
  }

  async clearUserCart(userId: string): Promise<void> {
    await prisma.cartItem.deleteMany({
      where: {
        userId,
      },
    });
  }

  async countUserCartItems(userId: string): Promise<number> {
    return await prisma.cartItem.count({
      where: {
        userId,
      },
    });
  }
}
