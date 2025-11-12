import type { User } from "../generated/prisma/client";
import { prisma } from "../database/prisma-client";
import type { RegisterInput } from "../schemas/auth.schema";
import { hashPassword } from "../shared/utils/password.utils";

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

  async updateEmail(userId: string, email: string): Promise<User> {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        email,
      },
    });
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<User> {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        hashedPassword: hashedPassword,
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
