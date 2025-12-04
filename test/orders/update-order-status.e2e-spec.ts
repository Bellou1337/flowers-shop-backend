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
import { OrderStatus, UserRole } from "../__mocks__/prisma-client";

describe("Orders - Update Status (PATCH /orders/:id/status)", () => {
  let app: Express;
  let adminToken: string;
  const adminUser = { ...testUser, role: UserRole.ADMIN };

  beforeAll(async () => {
    app = await createTestingApp();
    adminToken = generateValidToken(adminUser.id, "ADMIN");
  });

  beforeEach(() => {
    resetMocks();
  });

  describe("Success flow", () => {
    it("updates status for existing order when admin", async () => {
      const orderId = "55555555-5555-4555-8555-555555555555";
      const existingOrder = {
        id: orderId,
        userId: testUser.id,
        status: OrderStatus.PENDING,
        totalPrice: 2000,
        deliveryAddress: "Addr",
        contactPhone: "+7999",
        comment: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        orderItems: [
          {
            id: "order-item-1",
            orderId,
            productId: testProduct.id,
            quantity: 1,
            price: 2000,
            product: { ...testProduct, id: "prod-1" },
          },
        ],
      };

      const updatedOrder = {
        ...existingOrder,
        status: OrderStatus.CONFIRMED,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(adminUser);
      mockPrismaService.order.findUnique
        .mockResolvedValueOnce(existingOrder)
        .mockResolvedValueOnce({
          ...updatedOrder,
          orderItems: existingOrder.orderItems,
        });
      mockPrismaService.order.update.mockResolvedValue(updatedOrder);

      const response = await request(app)
        .patch(`/orders/${orderId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: ORDER_STATUSES.CONFIRMED });

      assertSuccessResponse(response, 200);
      assertOrderStructure(response.body);
      expect(response.body.status).toBe(ORDER_STATUSES.CONFIRMED);
    });
  });

  describe("Error cases", () => {
    it("returns 404 when order does not exist", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(adminUser);
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .patch("/orders/99999999-9999-4999-8999-999999999999/status")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: ORDER_STATUSES.CONFIRMED });

      assertErrorResponse(response, 404);
    });

    it("returns 400 for invalid status payload", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(adminUser);

      const response = await request(app)
        .patch("/orders/88888888-8888-4888-8888-888888888888/status")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "INVALID" });

      assertErrorResponse(response, 400);
    });
  });

  describe("Authorization", () => {
    it("returns 401 when token is missing", async () => {
      const response = await request(app)
        .patch("/orders/77777777-7777-4777-8777-777777777777/status")
        .send({ status: ORDER_STATUSES.CONFIRMED });
      assertErrorResponse(response, 401);
    });

    it("returns 403 for non-admin user", async () => {
      const userToken = generateValidToken(testUser.id, "USER");
      mockPrismaService.user.findUnique.mockResolvedValue(testUser);

      const response = await request(app)
        .patch("/orders/66666666-6666-4666-8666-666666666666/status")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ status: ORDER_STATUSES.CONFIRMED });

      expect([401, 403]).toContain(response.status);
    });
  });
});
