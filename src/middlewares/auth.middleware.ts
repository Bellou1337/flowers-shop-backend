import type { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { verifyAccessToken } from "../lib/jwt";
import { UserService } from "../user/user.service";

const userService = new UserService();

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { accessToken } = req.cookies;

  if (!accessToken) {
    throw createError(401, "Access token missing");
  }

  const { userId } = verifyAccessToken(accessToken);

  const user = await userService.findById(userId);

  if (!user) {
    throw createError(404, "User not found");
  }

  req.user = {
    id: user.id,
    role: user.role,
  };

  next();
};

export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await requireAuth(req, res, next);

  if (req.user?.role !== "ADMIN") {
    throw createError(403, "Admin access required");
  }
};
