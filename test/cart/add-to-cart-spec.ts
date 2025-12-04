import { Express } from "express";
import * as request from "supertest";
import {
  testUser,
  testProduct,
  generateValidToken,
  assertSuccessResponse,
  assertErrorResponse,
  assertCartItemStructure,
} from "../helpers/test-utils";
import { createTestingApp, mockPrismaService, resetMocks } from "../setup";
import { describe, it, expect, beforeAll, beforeEach } from "@jest/globals";

describe("Cart - Add Item (POST /cart)", () => {
  let app: Express;
  let token: string;

  beforeAll(async () => {
    app = await createTestingApp();
    token = generateValidToken(testUser.id);
  });

  beforeEach(() => {
    resetMocks();
    mockPrismaService.user.findUnique.mockResolvedValue(testUser);
  });

  describe("Success flow", () => {
    it("creates a new cart item when product exists and stock is enough", async () => {
      const dto = { productId: testProduct.id, quantity: 2 };

      mockPrismaService.product.findUnique.mockResolvedValue(testProduct);
      mockPrismaService.cartItem.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.cartItem.create.mockResolvedValue({
        id: "cart-item-id",
        userId: testUser.id,
        productId: testProduct.id,
        quantity: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        product: testProduct,
      });

      const response = await request(app)
        .post("/cart")
        .set("Authorization", `Bearer ${token}`)
        .send(dto);

      assertSuccessResponse(response, 200);
      assertCartItemStructure(response.body);
      expect(response.body.quantity).toBe(2);
      expect(response.body.product.id).toBe(testProduct.id);
    });

    it("increments quantity when item is already in cart", async () => {
      const dto = { productId: testProduct.id, quantity: 1 };

      mockPrismaService.product.findUnique.mockResolvedValue(testProduct);
      mockPrismaService.cartItem.findUnique
        .mockResolvedValueOnce({
          id: "cart-item-id",
          userId: testUser.id,
          productId: testProduct.id,
          quantity: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
          product: testProduct,
        })
        .mockResolvedValueOnce({
          id: "cart-item-id",
          userId: testUser.id,
          productId: testProduct.id,
          quantity: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
          product: testProduct,
        });

      mockPrismaService.cartItem.update.mockResolvedValue({
        id: "cart-item-id",
        userId: testUser.id,
        productId: testProduct.id,
        quantity: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
        product: testProduct,
      });

      const response = await request(app)
        .post("/cart")
        .set("Authorization", `Bearer ${token}`)
        .send(dto);

      assertSuccessResponse(response, 200);
      expect(response.body.quantity).toBe(3);
    });
  });

  describe("Validation and stock errors", () => {
    it("returns 404 when product does not exist", async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post("/cart")
        .set("Authorization", `Bearer ${token}`)
        .send({
          productId: "99999999-9999-4999-8999-999999999999",
          quantity: 1,
        });

      assertErrorResponse(response, 404);
    });

    it("returns 400 when stock is insufficient", async () => {
      mockPrismaService.product.findUnique.mockResolvedValue({
        ...testProduct,
        stock: 0,
      });

      const response = await request(app)
        .post("/cart")
        .set("Authorization", `Bearer ${token}`)
        .send({ productId: testProduct.id, quantity: 5 });

      assertErrorResponse(response, 400);
    });

    it("returns 400 for invalid quantity", async () => {
      const response = await request(app)
        .post("/cart")
        .set("Authorization", `Bearer ${token}`)
        .send({ productId: testProduct.id, quantity: 0 });
      assertErrorResponse(response, 400);
    });
  });

  describe("Authorization", () => {
    it("fails with 401 when token is missing", async () => {
      const response = await request(app)
        .post("/cart")
        .send({ productId: testProduct.id, quantity: 1 });
      assertErrorResponse(response, 401);
    });
  });
});
