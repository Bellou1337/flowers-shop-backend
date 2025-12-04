import * as jwt from "jsonwebtoken";
import { expect } from "@jest/globals";
import { UserRole } from "../__mocks__/prisma-client";

export const testUser = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "test@example.com",
  hashedPassword: "$2b$10$hashedpassword",
  name: "Test User",
  phone: "+79991234567",
  role: UserRole.USER,
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  updatedAt: new Date("2024-01-01T00:00:00.000Z"),
};

export const testProduct = {
  id: "22222222-2222-4222-8222-222222222222",
  name: "Test Flower",
  description: "Beautiful flower",
  price: 1000,
  stock: 10,
  imageUrl: "http://example.com/image.jpg",
  categoryId: "category-id-123",
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  updatedAt: new Date("2024-01-01T00:00:00.000Z"),
};

export function generateValidToken(
  userId: string = testUser.id,
  role: string = testUser.role
): string {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET || "test-secret", {
    expiresIn: "1h",
  });
}

export function generateExpiredToken(
  userId: string = testUser.id,
  role: string = testUser.role
): string {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET || "test-secret", {
    expiresIn: "-1h",
  });
}

export function assertSuccessResponse(response: any, statusCode: number = 200) {
  expect(response.status).toBe(statusCode);
  expect(response.body).toBeDefined();
}

export function assertErrorResponse(
  response: any,
  statusCode: number,
  messageContains?: string
) {
  expect(response.status).toBe(statusCode);
  if (messageContains) {
    expect(JSON.stringify(response.body)).toContain(messageContains);
  }
}

export function assertNoPasswordInResponse(body: any) {
  expect(body.password).toBeUndefined();
  expect(body.passwordHash).toBeUndefined();
}

export function assertUserStructure(user: any) {
  expect(user).toHaveProperty("id");
  expect(user).toHaveProperty("email");
  assertNoPasswordInResponse(user);
}

export function assertTokenStructure(body: any) {
  expect(body).toHaveProperty("accessToken");
  expect(typeof body.accessToken).toBe("string");
}

export function assertOrderStructure(order: any) {
  expect(order).toHaveProperty("id");
  expect(order).toHaveProperty("status");
  expect(order).toHaveProperty("totalPrice");
  expect(order).toHaveProperty("orderItems");
}

export function assertCartItemStructure(item: any) {
  expect(item).toHaveProperty("id");
  expect(item).toHaveProperty("quantity");
  expect(item).toHaveProperty("product");
  expect(item.product).toHaveProperty("id");
  expect(item.product).toHaveProperty("name");
  expect(item.product).toHaveProperty("price");
}
