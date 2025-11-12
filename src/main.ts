import { logger } from "./lib/logger";
import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.router";
import { userRouter } from "./routes/user.router";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger";
import { errorHandler } from "./middlewares/error-handler.middleware";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/auth", authRouter);
app.use("/users", userRouter);

app.use(errorHandler);

const port = process.env.APPLICATION_PORT || 4000;

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
