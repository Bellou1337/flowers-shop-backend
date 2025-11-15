import { CategoryService } from "./category.service";
import type { Request, Response } from "express";
import { createCategorySchema } from "../schemas/category.schema";
import createError from "http-errors";
import { deleteFile } from "../shared/utils/file.utils";
import { CategoryMapper } from "./category.mapper";
import path from "path";

const categoryService = new CategoryService();

export class CategoryController {
  static async createCategory(req: Request, res: Response) {
    const { name, description } = req.body;

    const parseResult = createCategorySchema.safeParse({
      name,
      description,
    });

    if (!parseResult.success) {
      if (req.file) {
        deleteFile(req.file.path);
      }
      return res.status(400).json({
        error: parseResult.error,
      });
    }

    const existingCategory = await categoryService.findByName(name);

    if (existingCategory) {
      if (req.file) {
        deleteFile(req.file.path);
      }
      throw createError(400, "Category already exists");
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const newCategory = await categoryService.createCategory({
      name,
      description,
      imageUrl,
    });

    res.status(200).json(CategoryMapper.toResponse(newCategory));
  }

  static async getCategoryById(req: Request, res: Response) {
    const { id } = req.params;

    const category = await categoryService.findById(id!);

    if (!category) {
      throw createError(404, "Category not found");
    }

    res.status(200).json(CategoryMapper.toResponse(category));
  }

  static async getAllCategories(req: Request, res: Response) {
    const { page, limit, order } = (req as any).validatedQuery;

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      categoryService.findMany({
        skip,
        take: limit,
        order,
      }),
      categoryService.count(),
    ]);

    res.status(200).json({
      items: items.map(CategoryMapper.toResponse),
      total,
      page,
      limit,
      order,
    });
  }

  static async updateCategory(req: Request, res: Response) {
    const { id } = req.params;

    const { name, description } = req.body;

    const category = await categoryService.findById(id!);

    if (!category) {
      if (req.file) {
        deleteFile(req.file.path);
      }
      throw createError(404, "Category not found");
    }

    let imageUrl = category?.imageUrl;
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

    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl;
    }

    const updatedCategory = await categoryService.updateCategory({
      id: id!,
      update: updateData,
    });

    res.status(200).json(CategoryMapper.toResponse(updatedCategory));
  }

  static async deleteCategory(req: Request, res: Response) {
    const { id } = req.params;

    const category = await categoryService.findById(id!);

    if (!category) {
      throw createError(404, "Category not found");
    }

    await categoryService.deleteCategory(id!);

    res.status(200).json({ message: "Category deleted successfully" });
  }
}
