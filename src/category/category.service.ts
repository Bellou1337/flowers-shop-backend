import { prisma } from "../database/prisma-client";
import type { CreateCategoryInput } from "../schemas/category.schema";
import type { Category } from "../generated/prisma/client";

export type CategoryPaginationInput = {
  skip: number;
  take: number;
  order: "asc" | "desc";
};

export type UpdateCategoryInput = {
  id: string;
  update: {
    name?: string;
    description?: string;
    imageUrl?: string | null;
  };
};

export class CategoryService {
  async findByName(name: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: {
        name,
      },
    });
  }

  async findById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: {
        id,
      },
    });
  }

  async createCategory(
    data: CreateCategoryInput & { imageUrl: string | null }
  ): Promise<Category> {
    return prisma.category.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        imageUrl: data.imageUrl ?? null,
      },
    });
  }

  async findMany(data: CategoryPaginationInput): Promise<Category[] | []> {
    return prisma.category.findMany({
      skip: data.skip,
      take: data.take,
      orderBy: {
        name: data.order,
      },
    });
  }

  async count() {
    return prisma.category.count();
  }

  async updateCategory(data: UpdateCategoryInput): Promise<Category> {
    return prisma.category.update({
      where: { id: data.id },
      data: data.update,
    });
  }

  async deleteCategory(id: string): Promise<void> {
    await prisma.category.delete({
      where: { id },
    });
  }
}
