import type { Request, Response } from "express";
import { ProductService } from "./product.service";
import createError from "http-errors";
import { deleteFile } from "../shared/utils/file.utils";
import { ProductMapper } from "./product.mapper";
import path from "path";
import { CategoryService } from "../category/category.service";

const productService = new ProductService();
const categoryService = new CategoryService();

export class ProductController {
  static async createProduct(req: Request, res: Response) {
    const { name, description, price, stock, categoryId } = req.body;

    const existingProduct = await productService.findByName(name);

    if (existingProduct) {
      if (req.file) {
        deleteFile(req.file.path);
      }
      throw createError(409, "Product already exists");
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const newProduct = await productService.createProduct({
      name,
      description,
      price,
      stock,
      categoryId,
      imageUrl,
    });

    res.status(200).json(ProductMapper.toResponse(newProduct));
  }

  static async getProductById(req: Request, res: Response) {
    const { id } = req.params;

    const product = await productService.findById(id!);

    if (!product) {
      throw createError(404, "Product not found");
    }

    res.status(200).json(ProductMapper.toResponse(product));
  }

  static async getAllProducts(req: Request, res: Response) {
    const { page, limit, order } = (req as any).validatedQuery;

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      productService.findMany({
        skip,
        take: limit,
        order,
      }),
      productService.count(),
    ]);

    res.status(200).json({
      items: items.map(ProductMapper.toResponse),
      total,
      page,
      limit,
      order,
    });
  }

  static async updateProduct(req: Request, res: Response) {
    const { id } = req.params;

    const { name, description, price, stock, categoryId } = req.body;

    const product = await productService.findById(id!);

    if (!product) {
      if (req.file) {
        deleteFile(req.file.path);
      }
      throw createError(404, "Product not found");
    }

    let imageUrl = product?.imageUrl;

    if (req.file) {
      if (imageUrl) {
        const oldImagePath = path.resolve(
          __dirname,
          "../../uploads",
          path.basename(imageUrl)
        );
        deleteFile(oldImagePath);
      }

      imageUrl = `/uploads/${req.file.filename}`;
    }

    const updateData: Record<string, any> = {};

    if (name !== undefined) {
      updateData.name = name;
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    if (price !== undefined) {
      updateData.price = price;
    }

    if (stock !== undefined) {
      updateData.stock = stock;
    }

    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl;
    }

    if (categoryId !== undefined) {
      updateData.categoryId = categoryId;

      const existingCategory = await categoryService.findById(categoryId);

      if (!existingCategory) {
        if (req.file) {
          deleteFile(req.file.path);
        }
        throw createError(404, "Category not found");
      }
    }

    const updatedProduct = await productService.updateProduct({
      id: id!,
      update: updateData,
    });

    res.status(200).json(ProductMapper.toResponse(updatedProduct));
  }

  static async deleteProduct(req: Request, res: Response) {
    const { id } = req.params;

    const product = await productService.findById(id!);

    if (!product) {
      throw createError(404, "Product not found");
    }

    if (product.imageUrl) {
      const oldImagePath = path.resolve(
        __dirname,
        "../../uploads",
        path.basename(product.imageUrl)
      );
      deleteFile(oldImagePath);
    }

    await productService.deleteProduct(id!);

    res.status(200).json({ message: "Product deleted successfully" });
  }

  static async getProductsByCategory(req: Request, res: Response) {
    const { categoryId, page, limit, order } = (req as any).validatedQuery;

    const skip = (page - 1) * limit;

    const existingCategory = await categoryService.findById(categoryId);

    if (!existingCategory) {
      throw createError(404, "Category not found");
    }

    const [items, total] = await Promise.all([
      productService.findByCategory(categoryId, {
        skip,
        take: limit,
        order,
      }),
      productService.countByCategory(categoryId),
    ]);

    res.status(200).json({
      items: items.map(ProductMapper.toResponse),
      total,
      page,
      limit,
      order,
    });
  }
}
