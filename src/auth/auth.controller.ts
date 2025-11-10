import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import type { UserResponse } from "../user/user.mapper";
import type { LoginResponse } from "./auth.service";
import { setCookie } from "../shared/utils/cookie.utils";
import createError from "http-errors";

const authService = new AuthService();

export class AuthController {
  static register = async (req: Request, res: Response) => {
    const result = (await authService.register(req.body)) as UserResponse;
    res.status(200).json(result);
  };

  static login = async (req: Request, res: Response) => {
    const { user, accessToken, refreshToken } = (await authService.login(
      req.body
    )) as LoginResponse;

    setCookie(
      res,
      "accessToken",
      accessToken,
      Number(process.env.JWT_ACCESS_EXPIRES_IN)
    );
    setCookie(
      res,
      "refreshToken",
      refreshToken,
      Number(process.env.JWT_REFRESH_EXPIRES_IN)
    );

    res.status(200).json({ ...user });
  };

  static refresh = async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw createError(401, "Refresh token is missing");
    }

    const { accessToken } = await authService.refresh(refreshToken);

    setCookie(
      res,
      "accessToken",
      accessToken,
      Number(process.env.JWT_ACCESS_EXPIRES_IN)
    );

    res.status(200).json({ message: "Token refreshed" });
  };

  static logout = async (req: Request, res: Response) => {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).json({ message: "Logged out successfully" });
  };
}
