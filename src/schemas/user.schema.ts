import { z } from "zod";

export const requestEmailChangeSchema = z.object({
  newEmail: z.string().email(),
});

export const tokenSchema = z.object({
  token: z.string(),
});

export const updatePasswordSchema = z.object({
  oldPassword: z.string().min(6).max(100),
  newPassword: z.string().min(6).max(100),
});

export const requestPasswordResetSchema = z.object({
  email: z.string().email(),
});

export const confirmPasswordResetSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(6).max(100),
});

export const updatePhoneSchema = z.object({
  newPhone: z.string().min(5).max(30),
});

export const updateNameSchema = z.object({
  newName: z.string().min(2).max(100),
});

export type TokenInput = z.infer<typeof tokenSchema>;

export type RequestEmailChangeInput = z.infer<typeof requestEmailChangeSchema>;

export type UpdatePhoneInput = z.infer<typeof updatePhoneSchema>;

export type UpdateNameInput = z.infer<typeof updateNameSchema>;

export type RequestPasswordResetInput = z.infer<
  typeof requestPasswordResetSchema
>;
export type ConfirmPasswordResetInput = z.infer<
  typeof confirmPasswordResetSchema
>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
