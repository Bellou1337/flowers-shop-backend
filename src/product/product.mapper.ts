import type { Product } from "../generated/prisma/client";

export type ProductResponse = Omit<Product, "createdAt" | "updatedAt">;

export class ProductMapper {
  static toResponse(product: Product): ProductResponse {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId,
      imageUrl: product.imageUrl,
    };
  }
}
