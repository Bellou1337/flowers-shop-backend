import type { LoginInput, RegisterInput } from "../schemas/auth.schema";
import createError from "http-errors";
import { UserService } from "../user/user.service";
import type { UserResponse } from "../user/user.mapper";
import { UserMapper } from "../user/user.mapper";
import { comparePassword } from "../shared/utils/password.utils";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../lib/jwt";

const userService = new UserService();

export type LoginResponse = {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
};

export class AuthService {
  async register(data: RegisterInput): Promise<UserResponse> {
    const user = await userService.findByEmail(data.email);

    if (user) {
      throw createError(409, "User already exists");
    }

    const createdUser = await userService.create(data);

    return UserMapper.toResponse(createdUser);
  }

  async login(data: LoginInput): Promise<LoginResponse> {
    const user = await userService.findByEmail(data.email);

    if (!user) {
      throw createError(404, "User not found");
    }

    const isPasswordValid = await comparePassword(
      data.password,
      user.hashedPassword
    );

    if (!isPasswordValid) {
      throw createError(401, "Invalid credentials");
    }

    const userPayload = {
      userId: user.id,
      role: user.role,
    };

    const accessToken = generateAccessToken(userPayload);

    const refreshToken = generateRefreshToken(userPayload);

    return {
      user: UserMapper.toResponse(user),
      accessToken,
      refreshToken,
    } as LoginResponse;
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    const decoded = verifyRefreshToken(refreshToken);

    const payload = {
      userId: decoded.userId,
      role: decoded.role,
    };

    const accessToken = generateAccessToken(payload);

    return { accessToken };
  }
}
