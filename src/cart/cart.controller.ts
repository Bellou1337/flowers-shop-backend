import type { Request, Response } from "express";
import { CartService } from "./cart.service";
import createError from "http-errors";
import { CartMapper } from "./cart.mapper";

const cartService = new CartService();

export class CartController {
  static async addToCart(req: Request, res: Response) {
    const { productId, quantity } = req.body;

    const userId = req.user?.id;

    const cartItem = await cartService.createCartItem({
      userId: userId!,
      productId,
      quantity,
    });

    res.status(200).json(CartMapper.toResponse(cartItem));
  }

  static async getCart(req: Request, res: Response) {
    const userId = req.user?.id;

    const cartItems = await cartService.findByUserId(userId!);

    res.status(200).json({
      items: CartMapper.toResponseArray(cartItems),
      total: cartItems.length,
    });
  }

  static async updateCartItem(req: Request, res: Response) {
    const { id } = req.params;
    const { quantity } = req.body;

    const cartItem = await cartService.updateCartItem({
      id: id!,
      quantity,
    });

    res.status(200).json(CartMapper.toResponse(cartItem));
  }

  static async removeFromCart(req: Request, res: Response) {
    const { id } = req.params;

    await cartService.deleteCartItem(id!);

    res.status(200).json({ message: "Item removed from cart successfully" });
  }

  static async clearCart(req: Request, res: Response) {
    const userId = req.user?.id;

    await cartService.clearUserCart(userId!);

    res.status(200).json({ message: "Cart cleared successfully" });
  }

  static async getCartItemCount(req: Request, res: Response) {
    const userId = req.user?.id;

    const count = await cartService.countUserCartItems(userId!);

    res.status(200).json({ count });
  }
}
