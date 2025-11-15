import type { Category } from "../generated/prisma/client";

export type CategoryResponse = Omit<Category, "createdAt" | "updatedAt">;

export class CategoryMapper {
  static toResponse(category: Category): CategoryResponse {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      imageUrl: category.imageUrl,
    };
  }
}
