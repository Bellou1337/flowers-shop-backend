import type { Response, Request } from "express";
import { UserService } from "./user.service";
import { UserMapper } from "./user.mapper";
import createError from "http-errors";
import { comparePassword, hashPassword } from "../shared/utils/password.utils";
import { sendEmail } from "../lib/email";
import {
  emailVerificationTemplate,
  passwordResetTemplate,
} from "../templates/email.templates";

const userService = new UserService();

export class UserController {
  static me = async (req: Request, res: Response) => {
    const user = await userService.findById(req.user!.id);

    res.json(UserMapper.toResponse(user!));
  };

  static requestEmailChange = async (req: Request, res: Response) => {
    const { newEmail } = req.body;

    const token = await userService.requestEmailChange(req.user!.id, newEmail);

    await sendEmail({
      to: newEmail,
      subject: "Подтверждение смены email",
      html: emailVerificationTemplate(token),
    });

    res.status(200).json({
      message: "Verification email sent to new email address",
    });
  };

  static confirmEmailChange = async (req: Request, res: Response) => {
    const { token } = req.body;

    const updatedUser = await userService.confirmEmailChange(token);

    res.status(200).json(UserMapper.toResponse(updatedUser));
  };

  static updatePassword = async (req: Request, res: Response) => {
    const { oldPassword, newPassword } = req.body;

    const user = await userService.findById(req.user!.id);

    const isOldPasswordValid = await comparePassword(
      oldPassword,
      user!.hashedPassword
    );

    if (!isOldPasswordValid) {
      throw createError(401, "Old password is incorrect");
    }

    const newHashedPassword = await hashPassword(newPassword);

    await userService.updatePassword(user!.id, newHashedPassword);

    res.status(200).json({
      message: "Password updated successfully",
    });
  };

  static updatePhone = async (req: Request, res: Response) => {
    const { newPhone } = req.body;

    const updatedUser = await userService.updatePhone(req.user!.id, newPhone);

    res.status(200).json(UserMapper.toResponse(updatedUser));
  };

  static updateName = async (req: Request, res: Response) => {
    const { newName } = req.body;

    const updatedUser = await userService.updateName(req.user!.id, newName);

    res.status(200).json(UserMapper.toResponse(updatedUser));
  };
}
