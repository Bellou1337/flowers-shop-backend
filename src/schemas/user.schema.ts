import { z } from "zod";

export const updateEmailSchema = z.object({
  newEmail: z.string().email(),
});

export const updatePasswordSchema = z.object({
  oldPassword: z.string().min(6).max(100),
  newPassword: z.string().min(6).max(100),
});

export const updatePhoneSchema = z.object({
  newPhone: z.string().min(5).max(30),
});

export const updateNameSchema = z.object({
  newName: z.string().min(2).max(100),
});

export type UpdateEmailInput = z.infer<typeof updateEmailSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type UpdatePhoneInput = z.infer<typeof updatePhoneSchema>;
export type UpdateNameInput = z.infer<typeof updateNameSchema>;
