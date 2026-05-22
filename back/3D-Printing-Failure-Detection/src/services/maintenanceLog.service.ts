import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";

export const createMaintenanceLog = async (data: Prisma.MaintenanceLogCreateInput) => {
  const printer = await prisma.printer.findUnique({
    where: { id: data.printer.connect?.id },
  });
  if (!printer) throw new Error("Printer not found");

  return prisma.maintenanceLog.create({
    data,
    include: { printer: true },
  });
};

export const getMaintenanceLogs = () => {
  return prisma.maintenanceLog.findMany({
    include: { printer: true },
  });
};

export const getMaintenanceLogById = (id: string) => {
  return prisma.maintenanceLog.findUnique({
    where: { id },
    include: { printer: true },
  });
};

export const getMaintenanceLogsByPrinter = async (printerId: string) => {
  const printer = await prisma.printer.findUnique({ where: { id: printerId } });
  if (!printer) throw new Error("Printer not found");

  return prisma.maintenanceLog.findMany({
    where: { printerId },
    include: { printer: true },
  });
};

export const updateMaintenanceLog = async (id: string, data: Prisma.MaintenanceLogUpdateInput) => {
  const log = await prisma.maintenanceLog.findUnique({ where: { id } });
  if (!log) throw new Error("Maintenance log not found");

  return prisma.maintenanceLog.update({
    where: { id },
    data,
    include: { printer: true },
  });
};

export const deleteMaintenanceLog = async (id: string) => {
  const log = await prisma.maintenanceLog.findUnique({ where: { id } });
  if (!log) throw new Error("Maintenance log not found");

  return prisma.maintenanceLog.delete({ where: { id } });
};

export const deleteManyMaintenanceLogsService = async (ids: string[]) => {
  if (!ids || ids.length === 0) {
    throw new Error("No IDs provided");
  }

  const result = await prisma.maintenanceLog.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });

  return result;
};