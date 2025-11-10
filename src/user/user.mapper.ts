import type { User } from "../generated/prisma/client";

export type UserResponse = Omit<
  User,
  "hashedPassword" | "createdAt" | "updatedAt"
>;

export class UserMapper {
  static toResponse(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
    };
  }
}
