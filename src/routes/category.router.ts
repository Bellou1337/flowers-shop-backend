import { Router } from "express";
import { requireAuth, requireAdmin } from "../middlewares/auth.middleware";
import { CategoryController } from "../category/category.controller";
import { upload } from "../middlewares/upload.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  getAllCategoriesSchema,
  categoryByIdSchema,
  updateCategorySchema,
} from "../schemas/category.schema";

export const categoryRouter = Router();

/**
 * @openapi
 * /categories:
 *   post:
 *     tags:
 *       - categories
 *     summary: Create a new category
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 255
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 imageUrl:
 *                   type: string
 *       400:
 *         description: Validation error or category already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Only image files (jpeg, png, gif, webp) are allowed or Category already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 */
categoryRouter.post(
  "/",
  requireAuth,
  requireAdmin,
  upload.single("image"),
  CategoryController.createCategory
);

/**
 * @openapi
 * /categories/{id}:
 *   get:
 *     tags:
 *       - categories
 *     summary: Get category by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 imageUrl:
 *                   type: string
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Category not found
 *       401:
 *         description: Unauthorized
 */
categoryRouter.get(
  "/:id",
  validate(categoryByIdSchema, "params"),
  requireAuth,
  CategoryController.getCategoryById
);

/**
 * @openapi
 * /categories:
 *   get:
 *     tags:
 *       - categories
 *     summary: Get all categories (with pagination and sorting)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number (default 1)
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Items per page (default 10)
 *       - name: order
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order by name (asc or desc, default asc)
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       imageUrl:
 *                         type: string
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 order:
 *                   type: string
 *                   enum: [asc, desc]
 *       401:
 *         description: Unauthorized
 */
categoryRouter.get(
  "/",
  validate(getAllCategoriesSchema, "query"),
  requireAuth,
  CategoryController.getAllCategories
);

/**
 * @openapi
 * /categories/{id}:
 *   patch:
 *     tags:
 *       - categories
 *     summary: Update category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 255
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 imageUrl:
 *                   type: string
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Category not found
 */
categoryRouter.patch(
  "/:id",
  validate(categoryByIdSchema, "params"),
  requireAuth,
  requireAdmin,
  upload.single("image"),
  validate(updateCategorySchema, "body"),
  CategoryController.updateCategory
);

/**
 * @openapi
 * /categories/{id}:
 *   delete:
 *     tags:
 *       - categories
 *     summary: Delete category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Category deleted successfully
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Category not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 */
categoryRouter.delete(
  "/:id",
  validate(categoryByIdSchema, "params"),
  requireAuth,
  requireAdmin,
  CategoryController.deleteCategory
);
