import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { CartController } from "../cart/cart.controller";
import { validate } from "../middlewares/validate.middleware";
import {
  cartItemSchema,
  cartItemParamsSchema,
  updateCartItemSchema,
} from "../schemas/cart.schema";

export const cartRouter = Router();

/**
 * @openapi
 * /cart:
 *   post:
 *     tags:
 *       - cart
 *     summary: Add item to cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 2
 *     responses:
 *       200:
 *         description: Item added to cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 quantity:
 *                   type: integer
 *                 product:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     price:
 *                       type: number
 *                     stock:
 *                       type: integer
 *                     imageUrl:
 *                       type: string
 *                     categoryId:
 *                       type: string
 *       400:
 *         description: Validation error or not enough stock
 *       404:
 *         description: Product not found
 *       401:
 *         description: Unauthorized
 */
cartRouter.post(
  "/",
  requireAuth,
  validate(cartItemSchema, "body"),
  CartController.addToCart
);

/**
 * @openapi
 * /cart:
 *   get:
 *     tags:
 *       - cart
 *     summary: Get user's cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's cart retrieved successfully
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
 *                       quantity:
 *                         type: integer
 *                       product:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           description:
 *                             type: string
 *                           price:
 *                             type: number
 *                           stock:
 *                             type: integer
 *                           imageUrl:
 *                             type: string
 *                           categoryId:
 *                             type: string
 *                 total:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 */
cartRouter.get("/", requireAuth, CartController.getCart);

/**
 * @openapi
 * /cart/count:
 *   get:
 *     tags:
 *       - cart
 *     summary: Get number of items in cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart item count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 */
cartRouter.get("/count", requireAuth, CartController.getCartItemCount);

/**
 * @openapi
 * /cart/{id}:
 *   patch:
 *     tags:
 *       - cart
 *     summary: Update cart item quantity
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Cart item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 3
 *     responses:
 *       200:
 *         description: Cart item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 quantity:
 *                   type: integer
 *                 product:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     price:
 *                       type: number
 *                     stock:
 *                       type: integer
 *                     imageUrl:
 *                       type: string
 *                     categoryId:
 *                       type: string
 *       400:
 *         description: Validation error or not enough stock
 *       404:
 *         description: Cart item not found
 *       401:
 *         description: Unauthorized
 */
cartRouter.patch(
  "/:id",
  requireAuth,
  validate(cartItemParamsSchema, "params"),
  validate(updateCartItemSchema, "body"),
  CartController.updateCartItem
);

/**
 * @openapi
 * /cart/{id}:
 *   delete:
 *     tags:
 *       - cart
 *     summary: Remove item from cart
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Cart item ID
 *     responses:
 *       200:
 *         description: Item removed from cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Item removed from cart successfully
 *       404:
 *         description: Cart item not found
 *       401:
 *         description: Unauthorized
 */
cartRouter.delete(
  "/:id",
  requireAuth,
  validate(cartItemParamsSchema, "params"),
  CartController.removeFromCart
);

/**
 * @openapi
 * /cart:
 *   delete:
 *     tags:
 *       - cart
 *     summary: Clear entire cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cart cleared successfully
 *       401:
 *         description: Unauthorized
 */
cartRouter.delete("/", requireAuth, CartController.clearCart);
