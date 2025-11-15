import { type ZodTypeAny, ZodError } from "zod";
import type { NextFunction, Request, Response } from "express";

export const validate =
  (schema: ZodTypeAny, source: "body" | "params" | "query" = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      let data;

      if (source === "body") {
        data = req.body;
      } else if (source === "params") {
        data = req.params;
      } else {
        data = req.query;
      }

      const result = schema.parse(data);

      if (source === "body") {
        req.body = result;
      } else if (source === "params") {
        req.params = result as any;
      } else {
        (req as any).validatedQuery = result;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ errors: error });
        return;
      }

      next(error);
    }
  };
