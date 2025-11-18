import { Router } from "express";
import { requireAuth, requireAdmin } from "../middlewares/auth.middleware";
import { OrderController } from "../order/order.controller";
import { validate } from "../middlewares/validate.middleware";
import {
  createOrderSchema,
  orderParamsSchema,
  orderQuerySchema,
  updateOrderStatusSchema,
  cancelOrderSchema,
  userOrderParamsSchema,
} from "../schemas/order.schema";

export const orderRouter = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     OrderItemResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         quantity:
 *           type: integer
 *         price:
 *           type: integer
 *         product:
 *           $ref: '#/components/schemas/ProductResponse'
 *     OrderResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         status:
 *           type: string
 *           enum: [PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED]
 *         totalPrice:
 *           type: integer
 *         deliveryAddress:
 *           type: string
 *         contactPhone:
 *           type: string
 *         comment:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         orderItems:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItemResponse'
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             phone:
 *               type: string
 *     ProductResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: integer
 *         stock:
 *           type: integer
 *         imageUrl:
 *           type: string
 *           nullable: true
 *         categoryId:
 *           type: string
 *           format: uuid
 *           nullable: true
 */

/**
 * @openapi
 * /orders:
 *   post:
 *     tags:
 *       - orders
 *     summary: Create order from cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deliveryAddress
 *               - contactPhone
 *             properties:
 *               deliveryAddress:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *                 example: "123 Main St, Moscow, Russia"
 *               contactPhone:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 30
 *                 example: "+79991234567"
 *               comment:
 *                 type: string
 *                 maxLength: 1000
 *                 example: "Please deliver after 6 PM"
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponse'
 *       400:
 *         description: Validation error or cart is empty
 *       401:
 *         description: Unauthorized
 */
orderRouter.post(
  "/",
  requireAuth,
  validate(createOrderSchema, "body"),
  OrderController.createOrder
);

/**
 * @openapi
 * /orders/user:
 *   get:
 *     tags:
 *       - orders
 *     summary: Get user orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - name: status
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED]
 *     responses:
 *       200:
 *         description: User orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OrderResponse'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 status:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */
orderRouter.get(
  "/user",
  requireAuth,
  validate(orderQuerySchema, "query"),
  OrderController.getUserOrders
);

/**
 * @openapi
 * /orders/statuses:
 *   get:
 *     tags:
 *       - orders
 *     summary: Get available order statuses
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order statuses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   value:
 *                     type: string
 *                     enum: [PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED]
 *                   label:
 *                     type: string
 *       401:
 *         description: Unauthorized
 */
orderRouter.get("/statuses", requireAuth, OrderController.getOrderStatuses);

/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     tags:
 *       - orders
 *     summary: Get order by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Order found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponse'
 *       403:
 *         description: Access denied
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 */
orderRouter.get(
  "/:id",
  requireAuth,
  validate(orderParamsSchema, "params"),
  OrderController.getOrderById
);

/**
 * @openapi
 * /orders/{id}/cancel:
 *   post:
 *     tags:
 *       - orders
 *     summary: Cancel order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 maxLength: 1000
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponse'
 *       400:
 *         description: Cannot cancel order
 *       403:
 *         description: Access denied
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 */
orderRouter.post(
  "/:id/cancel",
  requireAuth,
  validate(userOrderParamsSchema, "params"),
  validate(cancelOrderSchema, "body"),
  OrderController.cancelOrder
);

/**
 * @openapi
 * /orders:
 *   get:
 *     tags:
 *       - orders
 *     summary: Get all orders (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - name: status
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED]
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OrderResponse'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 status:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 */
orderRouter.get(
  "/",
  requireAuth,
  requireAdmin,
  validate(orderQuerySchema, "query"),
  OrderController.getAllOrders
);

/**
 * @openapi
 * /orders/{id}/status:
 *   patch:
 *     tags:
 *       - orders
 *     summary: Update order status (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED]
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponse'
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 */
orderRouter.patch(
  "/:id/status",
  requireAuth,
  requireAdmin,
  validate(orderParamsSchema, "params"),
  validate(updateOrderStatusSchema, "body"),
  OrderController.updateOrderStatus
);
