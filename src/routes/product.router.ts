import { Router } from "express";
import { requireAdmin, requireAuth } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";
import { ProductController } from "../product/product.controller";
import { validate } from "../middlewares/validate.middleware";
import {
  createProductSchema,
  getAllProductsSchema,
  getProductsByCategorySchema,
  productByIdSchema,
  updateProductSchema,
} from "../schemas/product.schema";

export const productRouter = Router();

/**
 * @openapi
 * /products:
 *   post:
 *     tags:
 *       - products
 *     summary: Create a new product
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - stock
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 255
 *               price:
 *                 type: number
 *                 minimum: 0
 *               stock:
 *                 type: integer
 *                 minimum: 1
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Product created successfully
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
 *                 price:
 *                   type: number
 *                 stock:
 *                   type: integer
 *                 categoryId:
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
 *       409:
 *         description: Product already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Product already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 */
productRouter.post(
  "/",
  requireAuth,
  requireAdmin,
  upload.single("image"),
  validate(createProductSchema, "body"),
  ProductController.createProduct
);

/**
 * @openapi
 * /products/by-category:
 *   get:
 *     tags:
 *       - products
 *     summary: Get products by category with pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: categoryId
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category ID
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
 *         description: List of products in category
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
 *                       price:
 *                         type: number
 *                       stock:
 *                         type: integer
 *                       categoryId:
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
productRouter.get(
  "/by-category",
  validate(getProductsByCategorySchema, "query"),
  requireAuth,
  ProductController.getProductsByCategory
);

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     tags:
 *       - products
 *     summary: Get product by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product found
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
 *                 price:
 *                   type: number
 *                 stock:
 *                   type: integer
 *                 categoryId:
 *                   type: string
 *                 imageUrl:
 *                   type: string
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Product not found
 *       401:
 *         description: Unauthorized
 */
productRouter.get(
  "/:id",
  validate(productByIdSchema, "params"),
  requireAuth,
  ProductController.getProductById
);

/**
 * @openapi
 * /products:
 *   get:
 *     tags:
 *       - products
 *     summary: Get all products (with pagination and sorting)
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
 *         description: List of products
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
 *                       price:
 *                         type: number
 *                       stock:
 *                         type: integer
 *                       categoryId:
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
productRouter.get(
  "/",
  validate(getAllProductsSchema, "query"),
  requireAuth,
  ProductController.getAllProducts
);

/**
 * @openapi
 * /products/{id}:
 *   patch:
 *     tags:
 *       - products
 *     summary: Update product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
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
 *               price:
 *                 type: number
 *                 minimum: 0
 *               stock:
 *                 type: integer
 *                 minimum: 1
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Product updated successfully
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
 *                 price:
 *                   type: number
 *                 stock:
 *                   type: integer
 *                 categoryId:
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
 *       404:
 *         description: Product not found or Category not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Product not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 */
productRouter.patch(
  "/:id",
  validate(productByIdSchema, "params"),
  requireAuth,
  requireAdmin,
  upload.single("image"),
  validate(updateProductSchema, "body"),
  ProductController.updateProduct
);

/**
 * @openapi
 * /products/{id}:
 *   delete:
 *     tags:
 *       - products
 *     summary: Delete product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product deleted successfully
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Product not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 */
productRouter.delete(
  "/:id",
  validate(productByIdSchema, "params"),
  requireAuth,
  requireAdmin,
  ProductController.deleteProduct
);
