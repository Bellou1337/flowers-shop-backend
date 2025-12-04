import { Express } from "express";
import * as request from "supertest";
import * as bcrypt from "bcrypt";
import { createTestingApp, mockPrismaService, resetMocks } from "../setup";
import { describe, it, expect, beforeAll, beforeEach } from "@jest/globals";
import {
  testUser,
  assertSuccessResponse,
  assertErrorResponse,
  assertTokenStructure,
  assertNoPasswordInResponse,
} from "../helpers/test-utils";

describe("Auth - Login (POST /auth/login)", () => {
  let app: Express;
  const validPassword = "Password123!";
  let hashedPassword: string;

  beforeAll(async () => {
    hashedPassword = await bcrypt.hash(validPassword, 10);
    app = await createTestingApp();
  });

  beforeEach(() => {
    resetMocks();
  });

  describe("Success flow", () => {
    it("returns access token and user on valid credentials", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...testUser,
        hashedPassword,
      });

      const response = await request(app)
        .post("/auth/login")
        .send({ email: testUser.email, password: validPassword });

      assertSuccessResponse(response, 200);
      assertTokenStructure(response.body);
      expect(response.body.user.email).toBe(testUser.email);
      assertNoPasswordInResponse(response.body.user);
    });
  });

  describe("Authentication errors", () => {
    it("returns 401 for wrong password", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...testUser,
        hashedPassword,
      });

      const response = await request(app)
        .post("/auth/login")
        .send({ email: testUser.email, password: "WrongPassword!" });

      assertErrorResponse(response, 401);
    });

    it("returns 404 when user not found", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post("/auth/login")
        .send({ email: "absent@example.com", password: validPassword });

      assertErrorResponse(response, 404);
    });
  });

  describe("Validation errors", () => {
    it("returns 400 when email is missing", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({ password: validPassword });
      assertErrorResponse(response, 400);
    });

    it("returns 400 when password is missing", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({ email: testUser.email });
      assertErrorResponse(response, 400);
    });

    it("returns 400 when email is invalid", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({ email: "not-email", password: validPassword });
      assertErrorResponse(response, 400);
    });
  });
});
