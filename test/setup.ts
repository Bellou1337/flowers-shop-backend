import type { Express } from "express";
import { jest } from "@jest/globals";
import type {
  User,
  Product,
  CartItem,
  Order,
  Prisma,
} from "./__mocks__/prisma-client";

type CartItemWithProduct = Prisma.CartItemGetPayload<{
  include: { product: true };
}>;

type OrderWithItems = Prisma.OrderGetPayload<{
  include: { orderItems: { include: { product: true } } };
}>;

type OrderItemWithProduct = Prisma.OrderItemGetPayload<{
  include: { product: true };
}>;

export const mockPrismaService = {
  user: {
    create: jest.fn<() => Promise<User | null>>(),
    findUnique: jest.fn<() => Promise<User | null>>(),
    findFirst: jest.fn<() => Promise<User | null>>(),
    update: jest.fn<() => Promise<User | null>>(),
    delete: jest.fn<() => Promise<User | null>>(),
  },
  product: {
    findUnique: jest.fn<() => Promise<Product | null>>(),
    findMany: jest.fn<() => Promise<Product[]>>(),
    update: jest.fn<() => Promise<Product | null>>(),
  },
  cartItem: {
    create: jest.fn<() => Promise<CartItemWithProduct | null>>(),
    findUnique: jest.fn<() => Promise<CartItemWithProduct | null>>(),
    findFirst: jest.fn<() => Promise<CartItemWithProduct | null>>(),
    findMany: jest.fn<() => Promise<CartItemWithProduct[]>>(),
    update: jest.fn<() => Promise<CartItemWithProduct | null>>(),
    delete: jest.fn<() => Promise<CartItem | null>>(),
    deleteMany: jest.fn<() => Promise<{ count: number }>>(),
    upsert: jest.fn<() => Promise<CartItemWithProduct | null>>(),
  },
  order: {
    create: jest.fn<() => Promise<Order | null>>(),
    findUnique: jest.fn<() => Promise<OrderWithItems | null>>(),
    findMany: jest.fn<() => Promise<OrderWithItems[]>>(),
    update: jest.fn<() => Promise<Order | null>>(),
    count: jest.fn<() => Promise<number>>(),
  },
  orderItem: {
    create: jest.fn<() => Promise<OrderItemWithProduct | null>>(),
    createMany: jest.fn<() => Promise<{ count: number }>>(),
    findMany: jest.fn<() => Promise<OrderItemWithProduct[]>>(),
  },
  $transaction: jest.fn((callback: any) =>
    typeof callback === "function"
      ? callback(mockPrismaService)
      : Promise.all(callback)
  ),
};

jest.mock("../src/database/prisma-client", () => ({
  prisma: mockPrismaService,
}));

jest.mock("../src/lib/email", () => ({
  sendEmail: jest.fn(),
}));

jest.mock("http-errors", () => {
  const actual =
    jest.requireActual<typeof import("http-errors")>("http-errors");
  return { __esModule: true, default: actual, ...actual };
});

jest.mock("../src/lib/jwt", () => {
  const jwt = jest.requireActual<typeof import("jsonwebtoken")>("jsonwebtoken");
  const createError =
    jest.requireActual<typeof import("http-errors")>("http-errors");
  const secret = process.env.JWT_SECRET || "test-secret";
  return {
    generateAccessToken: (payload: any) =>
      jwt.sign(payload, secret, { expiresIn: "1h" }),
    generateRefreshToken: (payload: any) =>
      jwt.sign(payload, secret, { expiresIn: "1d" }),
    verifyAccessToken: (token: string) => {
      try {
        return jwt.verify(token, secret) as any;
      } catch (error: any) {
        throw createError(401, error.message);
      }
    },
    verifyRefreshToken: (token: string) => {
      try {
        return jwt.verify(token, secret) as any;
      } catch (error: any) {
        throw createError(401, error.message);
      }
    },
  };
});

jest.mock("../src/shared/utils/order.utils", () => {
  const actual = jest.requireActual(
    "../src/shared/utils/order.utils"
  ) as Record<string, any>;
  const createError =
    jest.requireActual<typeof import("http-errors")>("http-errors");
  return {
    ...actual,
    validateStock: (items: any[]) => {
      for (const item of items) {
        if (item.product.stock < item.quantity) {
          throw createError(400, "Not enough stock available");
        }
      }
    },
  };
});

jest.mock("multer", () => {
  const middleware = () => (req: any, res: any, next: any) => next();
  const createInstance = () => ({
    single: () => middleware(),
    array: () => middleware(),
    fields: () => middleware(),
    none: () => middleware(),
  });
  const multerMock: any = () => createInstance();
  multerMock.diskStorage = () => ({});
  return { __esModule: true, default: multerMock };
});

export async function createTestingApp(): Promise<Express> {
  const expressModule = await import("express");
  const expressFn = (expressModule as any).default || expressModule;
  const cookieModule = await import("cookie-parser");
  const cookieParser = (cookieModule as any).default || cookieModule;
  const corsModule = await import("cors");
  const corsFn = (corsModule as any).default || corsModule;
  const app = expressFn();

  const { authRouter } = await import("../src/routes/auth.router");
  const { userRouter } = await import("../src/routes/user.router");
  const { categoryRouter } = await import("../src/routes/category.router");
  const { productRouter } = await import("../src/routes/product.router");
  const { cartRouter } = await import("../src/routes/cart.router");
  const { orderRouter } = await import("../src/routes/order.router");
  const { errorHandler } = await import(
    "../src/middlewares/error-handler.middleware"
  );

  app.use(expressFn.json());
  app.use(cookieParser());
  app.use(corsFn({ origin: true, credentials: true }));

  app.use("/auth", authRouter);
  app.use("/users", userRouter);
  app.use("/categories", categoryRouter);
  app.use("/products", productRouter);
  app.use("/cart", cartRouter);
  app.use("/orders", orderRouter);

  app.use(errorHandler);

  return app;
}

export function resetMocks() {
  Object.values(mockPrismaService).forEach((model) => {
    if (typeof model === "object" && model !== null) {
      Object.values(model).forEach((method) => {
        if (typeof method === "function" && "mockReset" in method) {
          (method as jest.Mock).mockReset();
        }
      });
    }
  });
}
