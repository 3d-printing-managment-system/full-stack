import { RequestHandler } from "express";
import * as service from "../services/cmdLogs.service";

type IdParam = { id: string };
type IdsParam = { id: string[] };

type PrinterParam = { printerId: string };

const handleError = (res: any, error: unknown) => {
  const message = error instanceof Error ? error.message : "Internal server error";
  const status =
    message.includes("not found") ? 404 :
    message.includes("Invalid") || message.includes("must") ? 400 :
    500;
  res.status(status).json({ error: message });
};

export const createCommandLog: RequestHandler = async (req, res) => {
  try {
    const data = await service.createCommandLog(req.body);
    res.status(201).json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const getCommandLogs: RequestHandler = async (_req, res) => {
  try {
    const data = await service.getCommandLogs();
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const getCommandLogById: RequestHandler<IdParam> = async (req, res) => {
  try {
    const data = await service.getCommandLogById(req.params.id);
    if (!data) return res.status(404).json({ error: "Command log not found" });
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const getCommandLogsByPrinter: RequestHandler<PrinterParam> = async (req, res) => {
  try {
    const data = await service.getCommandLogsByPrinter(req.params.printerId);
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const updateCommandLog: RequestHandler<IdParam> = async (req, res) => {
  try {
    const data = await service.updateCommandLog(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteCommandLog: RequestHandler<IdParam> = async (req, res) => {
  try {
    const data = await service.deleteCommandLog(req.params.id);
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteManyCommandLogs :RequestHandler<IdsParam[]   >= async (req, res) => {
  try {
    const { ids } = req.body;

    const result = await service.deleteManyCommandLogsService(ids);

    return res.status(200).json({
      message: "Command logs deleted successfully",
      deletedCount: result.count,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};