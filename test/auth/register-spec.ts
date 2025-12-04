import { Express } from "express";
import * as request from "supertest";
import { createTestingApp, mockPrismaService, resetMocks } from "../setup";
import {
  assertSuccessResponse,
  assertErrorResponse,
  assertNoPasswordInResponse,
  assertUserStructure,
} from "../helpers/test-utils";
import { describe, it, expect, beforeAll, beforeEach } from "@jest/globals";
import { UserRole } from "../__mocks__/prisma-client";

describe("Auth - Register (POST /auth/register)", () => {
  let app: Express;

  beforeAll(async () => {
    app = await createTestingApp();
  });

  beforeEach(() => {
    resetMocks();
  });

  describe("Success flow", () => {
    it("registers a new user with valid data", async () => {
      const dto = {
        email: "newuser@example.com",
        password: "Password123!",
        name: "New User",
        phone: "+79991234567",
      };

      const createdUser = {
        id: "new-user-id",
        email: dto.email,
        name: dto.name,
        phone: dto.phone,
        role: UserRole.USER,
        hashedPassword: "hashed",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(createdUser as any);

      const response = await request(app).post("/auth/register").send(dto);

      assertSuccessResponse(response, 200);
      const user = response.body.user || response.body;
      assertUserStructure(user);
      assertNoPasswordInResponse(user);
      expect(user.email).toBe(dto.email);
    });
  });

  describe("Conflicts", () => {
    it("returns 409 when email already exists", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: "existing-id",
        email: "dup@example.com",
        name: "Existing User",
        hashedPassword: "hashed",
        phone: "+79991234567",
        role: UserRole.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app).post("/auth/register").send({
        email: "dup@example.com",
        password: "Password123!",
        name: "Dup User",
        phone: "+79991234567",
      });

      assertErrorResponse(response, 409);
    });
  });

  describe("Validation errors", () => {
    it("returns 400 when email is missing", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({ password: "Password123!", name: "Name", phone: "+7999" });
      assertErrorResponse(response, 400);
    });

    it("returns 400 when email format is invalid", async () => {
      const response = await request(app).post("/auth/register").send({
        email: "invalid-email",
        password: "Password123!",
        name: "Name",
        phone: "+7999",
      });
      assertErrorResponse(response, 400);
    });

    it("returns 400 for too short password", async () => {
      const response = await request(app).post("/auth/register").send({
        email: "a@b.com",
        password: "123",
        name: "Name",
        phone: "+7999",
      });
      assertErrorResponse(response, 400);
    });

    it("returns 400 for too long password", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({
          email: "a@b.com",
          password: "a".repeat(101),
          name: "Name",
          phone: "+7999",
        });
      assertErrorResponse(response, 400);
    });
  });

  describe("Ignoring extra fields", () => {
    it("does not allow client to set role or ids", async () => {
      const dto = {
        email: "role@example.com",
        password: "Password123!",
        name: "Name",
        phone: "+7999",
        role: "ADMIN",
        id: "custom-id",
      } as any;

      const createdUser = {
        id: "generated-id",
        email: dto.email,
        name: dto.name,
        phone: dto.phone,
        role: "USER",
        hashedPassword: "hashed",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(createdUser as any);

      const response = await request(app).post("/auth/register").send(dto);

      const user = response.body.user || response.body;
      expect(user.role).toBe("USER");
      expect(user.id).toBe(createdUser.id);
    });
  });
});
