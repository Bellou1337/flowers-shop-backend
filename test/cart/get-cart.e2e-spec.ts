import { Express } from "express";
import * as request from "supertest";
import { createTestingApp, mockPrismaService, resetMocks } from "../setup";
import {
  testUser,
  testProduct,
  generateValidToken,
  assertSuccessResponse,
  assertErrorResponse,
  assertCartItemStructure,
} from "../helpers/test-utils";
import { describe, it, expect, beforeAll, beforeEach } from "@jest/globals";

describe("Cart - Get Cart (GET /cart)", () => {
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
    it("returns list of cart items for the user", async () => {
      const cartItems = [
        {
          id: "cart-item-1",
          userId: testUser.id,
          productId: testProduct.id,
          quantity: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
          product: testProduct,
        },
        {
          id: "cart-item-2",
          userId: testUser.id,
          productId: "product-2",
          quantity: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          product: { ...testProduct, id: "product-2", name: "Product 2" },
        },
      ];

      mockPrismaService.cartItem.findMany.mockResolvedValue(cartItems);

      const response = await request(app)
        .get("/cart")
        .set("Authorization", `Bearer ${validToken}`);

      assertSuccessResponse(response, 200);
      expect(Array.isArray(response.body.items)).toBe(true);
      expect(response.body.total).toBe(cartItems.length);
    });

    it("returns cart items with correct structure", async () => {
      const cartItems = [
        {
          id: "cart-item-1",
          userId: testUser.id,
          productId: testProduct.id,
          quantity: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
          product: testProduct,
        },
      ];

      mockPrismaService.cartItem.findMany.mockResolvedValue(cartItems);

      const response = await request(app)
        .get("/cart")
        .set("Authorization", `Bearer ${validToken}`);

      assertSuccessResponse(response, 200);
      assertCartItemStructure(response.body.items[0]);
    });

    it("returns empty array when cart is empty", async () => {
      mockPrismaService.cartItem.findMany.mockResolvedValue([]);

      const response = await request(app)
        .get("/cart")
        .set("Authorization", `Bearer ${validToken}`);

      assertSuccessResponse(response, 200);
      expect(response.body.items).toEqual([]);
      expect(response.body.total).toBe(0);
    });
  });

  describe("Authorization errors", () => {
    it("returns 401 when token is missing", async () => {
      const response = await request(app).get("/cart");
      assertErrorResponse(response, 401);
    });

    it("returns 401 when token is invalid", async () => {
      const response = await request(app)
        .get("/cart")
        .set("Authorization", "Bearer invalid");
      assertErrorResponse(response, 401);
    });
  });
});
