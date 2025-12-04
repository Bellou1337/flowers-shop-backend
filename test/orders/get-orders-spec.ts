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
import { ORDER_STATUSES } from "../../src/shared/constants/order.constants";
import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
} from "@jest/globals";
import { OrderStatus } from "../__mocks__/prisma-client";

describe("Orders - Get User Orders (GET /orders/user)", () => {
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
    it("returns a paginated list of user orders", async () => {
      const orders = [
        {
          id: "order-1",
          userId: testUser.id,
          status: OrderStatus.PENDING,
          totalPrice: 2000,
          deliveryAddress: "Somewhere 1",
          contactPhone: "+7999",
          comment: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          orderItems: [
            {
              id: "order-item-1",
              orderId: "order-1",
              productId: testProduct.id,
              quantity: 2,
              price: testProduct.price,
              product: testProduct,
            },
          ],
        },
      ];

      mockPrismaService.order.findMany.mockResolvedValue(orders);
      mockPrismaService.order.count.mockResolvedValue(orders.length);

      const response = await request(app)
        .get("/orders/user?page=1&limit=10")
        .set("Authorization", `Bearer ${validToken}`);

      assertSuccessResponse(response, 200);
      expect(response.body.total).toBe(1);
      expect(response.body.items.length).toBe(1);
      assertOrderStructure(response.body.items[0]);
    });

    it("supports filtering by status", async () => {
      mockPrismaService.order.findMany.mockResolvedValue([]);
      mockPrismaService.order.count.mockResolvedValue(0);

      const response = await request(app)
        .get(`/orders/user?status=${ORDER_STATUSES.DELIVERED}`)
        .set("Authorization", `Bearer ${validToken}`);

      assertSuccessResponse(response, 200);
      expect(response.body.status).toBe(ORDER_STATUSES.DELIVERED);
    });

    it("returns empty list when user has no orders", async () => {
      mockPrismaService.order.findMany.mockResolvedValue([]);
      mockPrismaService.order.count.mockResolvedValue(0);

      const response = await request(app)
        .get("/orders/user")
        .set("Authorization", `Bearer ${validToken}`);

      assertSuccessResponse(response, 200);
      expect(response.body.items).toEqual([]);
      expect(response.body.total).toBe(0);
    });
  });

  describe("Authorization errors", () => {
    it("returns 401 without token", async () => {
      const response = await request(app).get("/orders/user");
      assertErrorResponse(response, 401);
    });

    it("returns 401 with invalid token", async () => {
      const response = await request(app)
        .get("/orders/user")
        .set("Authorization", "Bearer invalid");
      assertErrorResponse(response, 401);
    });
  });
});
