import { RequestHandler } from "express";
import * as service from "../services/printer.service";

type IdParam = { id: string };

const handleError = (res: any, error: unknown) => {
  const message = error instanceof Error ? error.message : "Internal server error";
  const status =
    message.includes("not found") ? 404 :
    message.includes("Invalid") || message.includes("must") ? 400 :
    500;
  res.status(status).json({ error: message });
};

export const createPrinter: RequestHandler = async (req, res) => {
  try {
    const data = await service.createPrinter(req.body);
    res.status(201).json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const getPrinters: RequestHandler = async (_req, res) => {
  try {
    const data = await service.getPrinters();
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const getPrinterById: RequestHandler<IdParam> = async (req, res) => {
  try {
    const data = await service.getPrinterById(req.params.id);
    if (!data) return res.status(404).json({ error: "Printer not found" });
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const updatePrinter: RequestHandler<IdParam> = async (req, res) => {
  try {
    const data = await service.updatePrinter(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const deletePrinter: RequestHandler<IdParam> = async (req, res) => {
  try {
    const data = await service.deletePrinter(req.params.id);
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteManyPrinters: RequestHandler = async (req, res) => {
  try {
    const { ids } = req.body;

    const result = await service.deleteManyPrintersService(ids);

    return res.status(200).json({
      message: "Printers deleted successfully",
      deletedCount: result.count,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};