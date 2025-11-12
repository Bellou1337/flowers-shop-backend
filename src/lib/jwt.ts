import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;
const ACCESS_EXPIRES_IN = Number(process.env.JWT_ACCESS_EXPIRES_IN)!;
const REFRESH_EXPIRES_IN = Number(process.env.JWT_REFRESH_EXPIRES_IN)!;

export type TokenPayload = {
  userId: string;
  role: string;
};

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, SECRET, {
    expiresIn: ACCESS_EXPIRES_IN,
  });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, SECRET) as TokenPayload;
};
