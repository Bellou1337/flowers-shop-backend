import { Express } from "express";
import * as request from "supertest";
import { createTestingApp, mockPrismaService, resetMocks } from "../setup";
import {
  testUser,
  testProduct,
  generateValidToken,
  assertSuccessResponse,
  assertErrorResponse,
  assertOrderStructure,
} from "../helpers/test-utils";
import { OrderStatus } from "../__mocks__/prisma-client";
import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  jest,
} from "@jest/globals";

describe("Orders - Create Order (POST /orders)", () => {
  let app: Express;
  let validToken: string;

  beforeAll(async () => {
    app = await createTestingApp();
    validToken = generateValidToken(testUser.id);
  });

  beforeEach(() => {
    resetMocks();
    mockPrismaService.user.findUnique.mockResolvedValue(testUser);
  });

  describe("Success flow", () => {
    it("creates an order from the current cart and returns mapped response", async () => {
      const createOrderDto = {
        deliveryAddress: "221B Baker Street",
        contactPhone: "+79991234567",
        comment: "Call on arrival",
      };

      const cartItems = [
        {
          id: "cart-item-1",
          userId: testUser.id,
          productId: testProduct.id,
          quantity: 2,
          product: testProduct,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const createdOrder = {
        id: "33333333-3333-4333-8333-333333333333",
        userId: testUser.id,
        status: OrderStatus.PENDING,
        totalPrice: testProduct.price * 2,
        deliveryAddress: createOrderDto.deliveryAddress,
        contactPhone: createOrderDto.contactPhone,
        comment: createOrderDto.comment,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.cartItem.findMany.mockResolvedValue(cartItems);
      mockPrismaService.order.create.mockResolvedValue(createdOrder);
      mockPrismaService.orderItem.createMany.mockResolvedValue({ count: 1 });
      mockPrismaService.product.update.mockResolvedValue(testProduct);
      mockPrismaService.cartItem.deleteMany.mockResolvedValue({ count: 1 });
      mockPrismaService.$transaction.mockImplementation(async (callback) =>
        typeof callback === "function"
          ? callback(mockPrismaService)
          : Promise.all(callback)
      );
      mockPrismaService.order.findUnique.mockResolvedValue({
        ...createdOrder,
        orderItems: [
          {
            id: "44444444-4444-4444-8444-444444444444",
            orderId: createdOrder.id,
            productId: testProduct.id,
            quantity: 2,
            price: testProduct.price,
            product: testProduct,
          },
        ],
      });

      const response = await request(app)
        .post("/orders")
        .set("Authorization", `Bearer ${validToken}`)
        .send(createOrderDto);

      assertSuccessResponse(response, 201);
      assertOrderStructure(response.body);
      expect(response.body.orderItems[0].product.id).toBe(testProduct.id);
      expect(
        (mockPrismaService.cartItem.deleteMany as jest.Mock).mock.calls[0][0]
      ).toEqual({
        where: { userId: testUser.id },
      });
    });
  });

  describe("Business rule errors", () => {
    it("returns 400 when cart is empty", async () => {
      const dto = { deliveryAddress: "Any", contactPhone: "+7999" };
      mockPrismaService.cartItem.findMany.mockResolvedValue([]);

      const response = await request(app)
        .post("/orders")
        .set("Authorization", `Bearer ${validToken}`)
        .send(dto);

      assertErrorResponse(response, 400);
    });

    it("returns 400 when cart has insufficient stock", async () => {
      const dto = { deliveryAddress: "Any", contactPhone: "+7999" };
      mockPrismaService.cartItem.findMany.mockResolvedValue([
        {
          id: "cart-item-1",
          userId: testUser.id,
          productId: testProduct.id,
          quantity: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
          product: { ...testProduct, stock: 1 },
        },
      ]);

      const response = await request(app)
        .post("/orders")
        .set("Authorization", `Bearer ${validToken}`)
        .send(dto);

      assertErrorResponse(response, 400);
    });
  });

  describe("Validation errors", () => {
    it("returns 400 when deliveryAddress is missing", async () => {
      const response = await request(app)
        .post("/orders")
        .set("Authorization", `Bearer ${validToken}`)
        .send({ contactPhone: "+7999" });

      assertErrorResponse(response, 400);
    });

    it("returns 400 for invalid phone", async () => {
      const response = await request(app)
        .post("/orders")
        .set("Authorization", `Bearer ${validToken}`)
        .send({ deliveryAddress: "Main st", contactPhone: "bad" });

      assertErrorResponse(response, 400);
    });
  });

  describe("Authorization", () => {
    it("returns 401 without token", async () => {
      const response = await request(app)
        .post("/orders")
        .send({ deliveryAddress: "Main", contactPhone: "+7999" });

      assertErrorResponse(response, 401);
    });
  });
});
