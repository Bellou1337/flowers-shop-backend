import { type ZodTypeAny, ZodError } from "zod";
import type { NextFunction, Request, Response } from "express";

export const validate =
  (schema: ZodTypeAny) => (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ errors: error });
        return;
      }

      next(error);
    }
  };
