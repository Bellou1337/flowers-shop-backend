import type { User } from "../generated/prisma/client";
import { prisma } from "../database/prisma-client";
import type { RegisterInput } from "../schemas/auth.schema";
import { hashPassword } from "../shared/utils/password.utils";
import createError from "http-errors";
import { generateToken } from "../shared/utils/token.utils";
import { TOKEN_EXPIRATION_TIME } from "../shared/constants/token.constants";

export class UserService {
  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async create(data: RegisterInput): Promise<User> {
    const hashedPassword = await hashPassword(data.password);

    return await prisma.user.create({
      data: {
        email: data.email,
        hashedPassword: hashedPassword,
        name: data.name,
        phone: data.phone,
      },
    });
  }

  async requestEmailChange(userId: string, newEmail: string): Promise<string> {
    const existingUser = await this.findByEmail(newEmail);

    if (existingUser) {
      throw createError(409, "Email already in use");
    }

    await prisma.verificationToken.deleteMany({
      where: {
        userId: userId,
        type: "EMAIL_CHANGE",
      },
    });

    const token = generateToken();
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRATION_TIME);

    await prisma.verificationToken.create({
      data: {
        userId: userId,
        type: "EMAIL_CHANGE",
        token,
        data: newEmail,
        expiresAt,
      },
    });

    return token;
  }

  async confirmEmailChange(token: string): Promise<User> {
    const verification = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verification || verification.type !== "EMAIL_CHANGE") {
      throw createError(404, "Token not found");
    }

    if (verification.expiresAt < new Date()) {
      throw createError(400, "Verification token expired");
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: verification.userId,
      },
      data: {
        email: verification.data!,
      },
    });

    await prisma.verificationToken.delete({
      where: {
        id: verification.id,
      },
    });

    return updatedUser;
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<User> {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        hashedPassword: hashedPassword,
      },
    });
  }

  async requestPasswordReset(userId: string): Promise<string> {
    await prisma.verificationToken.deleteMany({
      where: {
        userId: userId,
        type: "PASSWORD_RESET",
      },
    });

    const token = generateToken();
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRATION_TIME);

    await prisma.verificationToken.create({
      data: {
        userId,
        type: "PASSWORD_RESET",
        token,
        expiresAt,
      },
    });

    return token;
  }

  async confirmPasswordReset(
    token: string,
    hashedPassword: string
  ): Promise<void> {
    const verification = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verification || verification.type !== "PASSWORD_RESET") {
      throw createError(404, "Token not found");
    }

    if (verification.expiresAt < new Date()) {
      throw createError(400, "Reset token expired");
    }

    await prisma.user.update({
      where: {
        id: verification.userId,
      },
      data: {
        hashedPassword,
      },
    });

    await prisma.verificationToken.delete({
      where: {
        id: verification.id,
      },
    });
  }

  async updatePhone(userId: string, phone: string): Promise<User> {
    return await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        phone,
      },
    });
  }

  async updateName(userId: string, name: string): Promise<User> {
    return await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name,
      },
    });
  }
}
