import bcrypt from "bcryptjs";
import { prisma } from "../config/database";
import type { UpdateProfileInput, AddressInput } from "../schemas/users.schema";

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  return prisma.user.update({
    where: { id: userId },
    data: input,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatarUrl: true,
      role: true,
      updatedAt: true,
    },
  });
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.password) throw new Error("NO_PASSWORD");

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) throw new Error("INVALID_CURRENT_PASSWORD");

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
}

export async function getAddresses(userId: string) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });
}

export async function createAddress(userId: string, input: AddressInput) {
  if (input.isDefault) {
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }
  return prisma.address.create({ data: { userId, ...input } });
}

export async function updateAddress(userId: string, addressId: string, input: Partial<AddressInput>) {
  const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
  if (!address) throw new Error("NOT_FOUND");

  if (input.isDefault) {
    await prisma.address.updateMany({
      where: { userId, id: { not: addressId } },
      data: { isDefault: false },
    });
  }

  return prisma.address.update({ where: { id: addressId }, data: input });
}

export async function deleteAddress(userId: string, addressId: string) {
  const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
  if (!address) throw new Error("NOT_FOUND");
  return prisma.address.delete({ where: { id: addressId } });
}

export async function setDefaultAddress(userId: string, addressId: string) {
  const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
  if (!address) throw new Error("NOT_FOUND");

  await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  return prisma.address.update({ where: { id: addressId }, data: { isDefault: true } });
}

// Admin
export async function getAllUsers(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count(),
  ]);
  return { users, total };
}

export async function updateUserRole(userId: string, role: "CUSTOMER" | "ADMIN") {
  return prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  });
}
