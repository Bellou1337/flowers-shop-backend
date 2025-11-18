import type { Request, Response } from "express";
import { OrderService } from "./order.service";
import { OrderMapper } from "./order.mapper";
import createError from "http-errors";
import { ORDER_STATUSES } from "../shared/constants/order.constants";

const orderService = new OrderService();

export class OrderController {
  static createOrder = async (req: Request, res: Response) => {
    const { deliveryAddress, contactPhone, comment } = req.body;
    const userId = (req as any).user.id;

    const orderId = await orderService.createOrderFromCart({
      userId,
      deliveryAddress,
      contactPhone,
      comment,
    });

    const order = await orderService.findById(orderId);
    if (!order) {
      throw createError(500, "Failed to create order");
    }

    res.status(201).json(OrderMapper.toResponse(order));
  };

  static getOrderById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    let order;
    if (userRole === "ADMIN") {
      order = await orderService.findByIdWithUser(id!);
    } else {
      const ownsOrder = await orderService.userOwnsOrder(id!, userId);
      if (!ownsOrder) {
        throw createError(403, "Access denied");
      }
      order = await orderService.findById(id!);
    }

    if (!order) {
      throw createError(404, "Order not found");
    }

    res.status(200).json(OrderMapper.toResponse(order));
  };

  static getUserOrders = async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { page, limit, status } = (req as any).validatedQuery;

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      orderService.findByUserId(userId, { skip, take: limit, status }),
      orderService.countUserOrders(userId, status),
    ]);

    res.status(200).json({
      items: OrderMapper.toArrayResponse(orders),
      total,
      page,
      limit,
      status,
    });
  };

  static getAllOrders = async (req: Request, res: Response) => {
    const { page, limit, status } = (req as any).validatedQuery;

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      orderService.findAll({ skip, take: limit, status }),
      orderService.countAllOrders(status),
    ]);

    res.status(200).json({
      items: OrderMapper.toArrayResponse(orders),
      total,
      page,
      limit,
      status,
    });
  };

  static updateOrderStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    const updatedOrder = await orderService.updateOrderStatus({
      id: id!,
      status,
    });

    const fullOrder = await orderService.findById(updatedOrder.id);
    if (!fullOrder) {
      throw createError(500, "Failed to fetch updated order");
    }

    res.status(200).json(OrderMapper.toResponse(fullOrder));
  };

  static cancelOrder = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    const orderId = await orderService.cancelOrder(
      id!,
      userRole === "ADMIN" ? undefined : userId
    );

    const order = await orderService.findById(orderId);
    if (!order) {
      throw createError(500, "Failed to fetch cancelled order");
    }

    res.status(200).json(OrderMapper.toResponse(order));
  };

  static getOrderStatuses = async (req: Request, res: Response) => {
    const statusLabels: Record<string, string> = {
      [ORDER_STATUSES.PENDING]: "Pending",
      [ORDER_STATUSES.CONFIRMED]: "Confirmed",
      [ORDER_STATUSES.PROCESSING]: "Processing",
      [ORDER_STATUSES.SHIPPED]: "Shipped",
      [ORDER_STATUSES.DELIVERED]: "Delivered",
      [ORDER_STATUSES.CANCELLED]: "Cancelled",
    };

    const statuses = Object.entries(ORDER_STATUSES).map(([key, value]) => ({
      value,
      label: statusLabels[value],
    }));

    res.status(200).json(statuses);
  };
}
