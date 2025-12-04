import { Express } from "express";
import * as request from "supertest";
import {
  testUser,
  generateValidToken,
  generateExpiredToken,
  assertSuccessResponse,
  assertErrorResponse,
  assertNoPasswordInResponse,
  assertUserStructure,
} from "../helpers/test-utils";
import { createTestingApp, mockPrismaService, resetMocks } from "../setup";
import { describe, it, expect, beforeAll, beforeEach } from "@jest/globals";

describe("Auth - Profile (GET /users/me)", () => {
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
    it("returns current user when token is valid", async () => {
      const response = await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${validToken}`);

      assertSuccessResponse(response, 200);
      assertUserStructure(response.body);
      expect(response.body.email).toBe(testUser.email);
      assertNoPasswordInResponse(response.body);
    });
  });

  describe("Authorization errors", () => {
    it("returns 401 when token is missing", async () => {
      const response = await request(app).get("/users/me");
      assertErrorResponse(response, 401);
    });

    it("returns 401 when token is expired", async () => {
      const response = await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${generateExpiredToken(testUser.id)}`);
      assertErrorResponse(response, 401);
    });

    it("returns 401 when token is invalid", async () => {
      const response = await request(app)
        .get("/users/me")
        .set("Authorization", "Bearer invalid");
      assertErrorResponse(response, 401);
    });
  });
});
