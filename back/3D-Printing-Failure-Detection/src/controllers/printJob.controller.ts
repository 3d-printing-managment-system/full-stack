import { RequestHandler } from "express";
import * as service from "../services/printJob.service";

type IdParam = { id: string };

const handleError = (res: any, error: unknown) => {
  const message = error instanceof Error ? error.message : "Internal server error";
  const status =
    message.includes("not found") ? 404 :
    message.includes("Only") || message.includes("cannot") || message.includes("must be") ? 400 :
    500;
  res.status(status).json({ error: message });
};

export const createJob: RequestHandler = async (req, res) => {
  try {
    const data = await service.createPrintJob(req.body);
    res.status(201).json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const getAllJobs: RequestHandler = async (_req, res) => {
  try {
    const data = await service.getPrintJobs();
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const getJobById: RequestHandler<IdParam> = async (req, res) => {
  try {
    const data = await service.getPrintJobById(req.params.id);
    if (!data) return res.status(404).json({ error: "Job not found" });
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const startJob: RequestHandler<IdParam> = async (req, res) => {
  try {
    const data = await service.startPrintJob(req.params.id);
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const cancelJob: RequestHandler<IdParam> = async (req, res) => {
  try {
    const data = await service.cancelJob(req.params.id);
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const pauseJob: RequestHandler<IdParam> = async (req, res) => {
  try {
    const data = await service.pauseJob(req.params.id);
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const resumeJob: RequestHandler<IdParam> = async (req, res) => {
  try {
    const data = await service.resumeJob(req.params.id);
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const failJob: RequestHandler<IdParam> = async (req, res) => {
  try {
    const data = await service.failJob(req.params.id);
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const updateJobProgress: RequestHandler<IdParam> = async (req, res) => {
  try {
    const { progress } = req.body; 
    const data = await service.updateProgress(req.params.id, progress);
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteJob: RequestHandler<IdParam> = async (req, res) => {
  try {
    const data = await service.deletePrintJob(req.params.id);
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteManyJobs: RequestHandler = async (req, res) => {
  try {
    const { ids } = req.body;

    const result = await service.deleteManyPrintJobsService(ids);

    return res.status(200).json({
      message: "Print jobs deleted successfully",
      deletedCount: result.count,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};