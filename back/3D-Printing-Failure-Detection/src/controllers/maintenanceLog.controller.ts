import { RequestHandler } from "express";
import * as service from "../services/maintenanceLog.service";

type IdParam = { id: string };
type PrinterParam = { printerId: string };

const handleError = (res: any, error: unknown) => {
  const message = error instanceof Error ? error.message : "Internal server error";
  const status =
    message.includes("not found") ? 404 :
    message.includes("Invalid") || message.includes("must") ? 400 :
    500;
  res.status(status).json({ error: message });
};

export const createMaintenanceLog: RequestHandler = async (req, res) => {
  try {
    const data = await service.createMaintenanceLog(req.body);
    res.status(201).json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const getMaintenanceLogs: RequestHandler = async (_req, res) => {
  try {
    const data = await service.getMaintenanceLogs();
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const getMaintenanceLogById: RequestHandler<IdParam> = async (req, res) => {
  try {
    const data = await service.getMaintenanceLogById(req.params.id);
    if (!data) return res.status(404).json({ error: "Maintenance log not found" });
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const getMaintenanceLogsByPrinter: RequestHandler<PrinterParam> = async (req, res) => {
  try {
    const data = await service.getMaintenanceLogsByPrinter(req.params.printerId);
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const updateMaintenanceLog: RequestHandler<IdParam> = async (req, res) => {
  try {
    const data = await service.updateMaintenanceLog(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteMaintenanceLog: RequestHandler<IdParam> = async (req, res) => {
  try {
    const data = await service.deleteMaintenanceLog(req.params.id);
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteManyMaintenanceLogs: RequestHandler = async (req, res) => {
  try {
    const { ids } = req.body;

    const result = await service.deleteManyMaintenanceLogsService(ids);

    return res.status(200).json({
      message: "Maintenance logs deleted successfully",
      deletedCount: result.count,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};