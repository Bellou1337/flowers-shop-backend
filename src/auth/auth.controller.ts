import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import type { UserResponse } from "../user/user.mapper";
import type { LoginResponse } from "./auth.service";
import { setCookie } from "../shared/utils/cookie.utils";
import createError from "http-errors";
import { sendEmail } from "../lib/email";
import { UserService } from "../user/user.service";
import { passwordResetTemplate } from "../templates/email.templates";
import { hashPassword } from "../shared/utils/password.utils";

const authService = new AuthService();
const userService = new UserService();

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
      "refreshToken",
      refreshToken,
      Number(process.env.JWT_REFRESH_EXPIRES_IN)
    );

    res.status(200).json({
      accessToken,
      user: user,
    });
  };

  static refresh = async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw createError(401, "Refresh token is missing");
    }

    const { accessToken } = await authService.refresh(refreshToken);

    res.status(200).json({ accessToken: accessToken });
  };

  static logout = async (req: Request, res: Response) => {
    res.clearCookie("refreshToken");

    res.status(200).json({ message: "Logged out successfully" });
  };

  static requestPasswordReset = async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await userService.findByEmail(email);

    if (!user) {
      return res.status(200).json({
        message: "If user exists, password reset email has been sent",
      });
    }

    const token = await userService.requestPasswordReset(user.id);

    await sendEmail({
      to: email,
      subject: "Сброс пароля",
      html: passwordResetTemplate(token),
    });

    res.status(200).json({
      message: "If user exists, password reset email has been sent",
    });
  };

  static confirmPasswordReset = async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    const hashedPassword = await hashPassword(newPassword);

    await userService.confirmPasswordReset(token, hashedPassword);

    res.status(200).json({
      message: "Password has been reset successfully",
    });
  };
}
