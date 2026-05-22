import { prisma } from "../../lib/prisma";

interface CreatePartInput {
  image: string;
  title: string;
  duration: number;
  nozzleDiameter: number;
  filamentUsed: number;
}

interface UpdatePartInput {
  image?: string;
  title?: string;
  duration?: number;
  nozzleDiameter?: number;
  filamentUsed?: number;
}

export const createPart = (data: CreatePartInput) => {
  return prisma.part.create({ data });
};

export const getParts = () => {
  return prisma.part.findMany({
    include: { printJobs: true },
  });
};

export const getPartById = (id: string) => {
  return prisma.part.findUnique({
    where: { id },
    include: { printJobs: true },
  });
};

export const updatePart = (id: string, data: UpdatePartInput) => {
  return prisma.part.update({
    where: { id },
    data,
  });
};

export const deletePart = async (id: string) => {
  const part = await prisma.part.findUnique({ where: { id } });
  if (!part) throw new Error("Part not found");

  await prisma.printJob.deleteMany({
    where: { fileId: id },
  });

  return prisma.part.delete({
    where: { id },
  });
};

export const deleteManyPartsService = async (ids: string[]) => {
  if (!ids || ids.length === 0) {
    throw new Error("No IDs provided");
  }

  await prisma.printJob.deleteMany({
    where: {
      fileId: {
        in: ids,
      },
    },
  });

  const result = await prisma.part.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });

  return result;
};