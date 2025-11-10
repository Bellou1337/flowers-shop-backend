import type { Request, Response, NextFunction } from "express";
import { HttpError } from "http-errors";
import { logger } from "../lib/logger";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  logger.error(err);
  res.status(500).json({ error: "Internal Server Error" });
};
