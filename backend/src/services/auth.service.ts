import bcrypt from "bcryptjs";
import { prisma } from "../config/database";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
} from "../utils/tokenUtils";
import type { RegisterInput, LoginInput } from "../schemas/auth.schema";

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new Error("EMAIL_TAKEN");

  const hashedPassword = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashedPassword,
      phone: input.phone,
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  return user;
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !user.password) throw new Error("INVALID_CREDENTIALS");

  const valid = await bcrypt.compare(input.password, user.password);
  if (!valid) throw new Error("INVALID_CREDENTIALS");

  const accessToken = signAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });
  const refreshToken = signRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  };
}

export async function refreshTokens(token: string) {
  let payload: { userId: string };
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new Error("INVALID_REFRESH_TOKEN");
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.expiresAt < new Date()) {
    throw new Error("INVALID_REFRESH_TOKEN");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) throw new Error("INVALID_REFRESH_TOKEN");

  // Rotate tokens
  await prisma.refreshToken.delete({ where: { token } });

  const newAccessToken = signAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });
  const newRefreshToken = signRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: user.id,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

export async function logoutUser(token: string) {
  await prisma.refreshToken.deleteMany({ where: { token } });
}

export async function getMe(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      avatarUrl: true,
      emailVerified: true,
      createdAt: true,
    },
  });
}
