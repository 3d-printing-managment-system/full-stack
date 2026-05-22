import { RequestHandler } from "express";
import * as service from "../services/printerTag.service";

type PrinterParam = { printerId: string };
type PrinterTagParam = { printerId: string; tagId: string };

const handleError = (res: any, error: unknown) => {
  const message = error instanceof Error ? error.message : "Internal server error";
  const status =
    message.includes("not found") ? 404 :
    message.includes("already") ? 409 :
    message.includes("Invalid") || message.includes("must") ? 400 :
    500;
  res.status(status).json({ error: message });
};

export const addTagToPrinter: RequestHandler<PrinterParam> = async (req, res) => {
  try {
    const { tagId } = req.body;
    const data = await service.addTagToPrinter(req.params.printerId, tagId);
    res.status(201).json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const removeTagFromPrinter: RequestHandler<PrinterTagParam> = async (req, res) => {
  try {
    const data = await service.removeTagFromPrinter(req.params.printerId, req.params.tagId);
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const getTagsForPrinter: RequestHandler<PrinterParam> = async (req, res) => {
  try {
    const data = await service.getTagsForPrinter(req.params.printerId);
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteManyPrinterTags: RequestHandler = async (req, res) => {
  try {
    const { pairs } = req.body;

    const result = await service.deleteManyPrinterTagsService(pairs);

    return res.status(200).json({
      message: "Printer tags deleted successfully",
      deletedCount: result.count,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};