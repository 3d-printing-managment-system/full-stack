import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";

export const createInventory = async (data: Prisma.InventoryCreateInput) => {
  const profile = await prisma.filamentProfile.findUnique({
    where: { id: data.profile.connect?.id },
  });
  if (!profile) throw new Error("Filament profile not found");

  return prisma.inventory.create({
    data,
    include: { profile: true },
  });
};

export const getInventories = () => {
  return prisma.inventory.findMany({
    include: { profile: true },
  });
};

export const getInventoryById = (id: string) => {
  return prisma.inventory.findUnique({
    where: { id },
    include: { profile: true },
  });
};

export const getInventoriesByProfile = async (profileId: string) => {
  const profile = await prisma.filamentProfile.findUnique({ where: { id: profileId } });
  if (!profile) throw new Error("Filament profile not found");

  return prisma.inventory.findMany({
    where: { profileId },
    include: { profile: true },
  });
};

export const updateInventory = async (id: string, data: Prisma.InventoryUpdateInput) => {
  const inventory = await prisma.inventory.findUnique({ where: { id } });
  if (!inventory) throw new Error("Inventory not found");

  return prisma.inventory.update({
    where: { id },
    data,
    include: { profile: true },
  });
};

export const deleteInventory = async (id: string) => {
  const inventory = await prisma.inventory.findUnique({ where: { id } });
  if (!inventory) throw new Error("Inventory not found");

  return prisma.inventory.delete({ where: { id } });
};

export const deleteManyInventoriesService = async (ids: string[]) => {
  if (!ids || ids.length === 0) {
    throw new Error("No IDs provided");
  }

  const result = await prisma.inventory.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });

  return result;
};