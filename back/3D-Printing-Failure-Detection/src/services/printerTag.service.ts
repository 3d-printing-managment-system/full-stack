import { prisma } from "../../lib/prisma";

export const addTagToPrinter = async (printerId: string, tagId: string) => {
  const printer = await prisma.printer.findUnique({ where: { id: printerId } });
  if (!printer) throw new Error("Printer not found");

  const tag = await prisma.tag.findUnique({ where: { id: tagId } });
  if (!tag) throw new Error("Tag not found");

  const existing = await prisma.printerTag.findUnique({
    where: { printerId_tagId: { printerId, tagId } },
  });
  if (existing) throw new Error("Tag already assigned to this printer");

  return prisma.printerTag.create({
    data: { printerId, tagId },
    include: { printer: true, tag: true },
  });
};

export const removeTagFromPrinter = async (printerId: string, tagId: string) => {
  const existing = await prisma.printerTag.findUnique({
    where: { printerId_tagId: { printerId, tagId } },
  });
  if (!existing) throw new Error("Tag not assigned to this printer");

  return prisma.printerTag.delete({
    where: { printerId_tagId: { printerId, tagId } },
  });
};

export const getTagsForPrinter = async (printerId: string) => {
  const printer = await prisma.printer.findUnique({ where: { id: printerId } });
  if (!printer) throw new Error("Printer not found");

  return prisma.printerTag.findMany({
    where: { printerId },
    include: { tag: true },
  });
};

export const deleteManyPrinterTagsService = async (printerTagPairs: { printerId: string; tagId: string }[]) => {
  if (!printerTagPairs || printerTagPairs.length === 0) {
    throw new Error("No printer-tag pairs provided");
  }

  let deletedCount = 0;
  for (const pair of printerTagPairs) {
    try {
      await prisma.printerTag.delete({
        where: {
          printerId_tagId: pair,
        },
      });
      deletedCount++;
    } catch (error) {
      // Record doesn't exist, skip it
      continue;
    }
  }

  return { count: deletedCount };
};