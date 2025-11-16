import { prisma } from "../database/prisma-client";
import type { Product } from "../generated/prisma/client";

export type ProductInput = {
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId?: string;
  imageUrl?: string | null;
};

export type ProductPaginationInput = {
  skip: number;
  take: number;
  order: "asc" | "desc";
};

export type UpdateProductInput = {
  id: string;
  update: {
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
    categoryId?: string;
    imageUrl?: string | null;
  };
};

export class ProductService {
  async findByName(name: string) {
    return await prisma.product.findUnique({
      where: { name },
    });
  }

  async createProduct(data: ProductInput): Promise<Product> {
    return await prisma.product.create({
      data,
    });
  }

  async findById(id: string): Promise<Product | null> {
    return await prisma.product.findUnique({
      where: { id },
    });
  }

  async findMany(data: ProductPaginationInput): Promise<Product[] | []> {
    return prisma.product.findMany({
      skip: data.skip,
      take: data.take,
      orderBy: {
        name: data.order,
      },
    });
  }

  async count() {
    return prisma.product.count();
  }

  async updateProduct(data: UpdateProductInput): Promise<Product> {
    return prisma.product.update({
      where: {
        id: data.id,
      },
      data: data.update,
    });
  }

  async deleteProduct(id: string): Promise<void> {
    await prisma.product.delete({
      where: { id },
    });
  }

  async findByCategory(
    categoryId: string,
    pagination: ProductPaginationInput
  ): Promise<Product[] | []> {
    return prisma.product.findMany({
      where: { categoryId },
      skip: pagination.skip,
      take: pagination.take,
      orderBy: {
        name: pagination.order,
      },
    });
  }

  async countByCategory(categoryId: string): Promise<number> {
    return prisma.product.count({
      where: {
        categoryId,
      },
    });
  }
}
