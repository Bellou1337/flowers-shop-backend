import type { CartItem, Product } from "../generated/prisma/client";
import type { ProductResponse } from "../product/product.mapper";

export type CartItemResponse = {
  id: string;
  quantity: number;
  product: ProductResponse;
};

export class CartMapper {
  static toResponse(
    cartItem: CartItem & { product: Product }
  ): CartItemResponse {
    return {
      id: cartItem.id,
      quantity: cartItem.quantity,
      product: {
        id: cartItem.product.id,
        name: cartItem.product.name,
        description: cartItem.product.description,
        price: cartItem.product.price,
        stock: cartItem.product.stock,
        imageUrl: cartItem.product.imageUrl,
        categoryId: cartItem.product.categoryId,
      },
    };
  }

  static toResponseArray(
    cartItems: (CartItem & { product: Product })[]
  ): CartItemResponse[] {
    return cartItems.map(CartMapper.toResponse);
  }
}
