import { RequestHandler } from "express";
import * as service from "../services/tag.service";

type IdParam = { id: string };

const handleError = (res: any, error: unknown) => {
  const message = error instanceof Error ? error.message : "Internal server error";
  const status =
    message.includes("not found") ? 404 :
    message.includes("Invalid") || message.includes("must") ? 400 :
    500;
  res.status(status).json({ error: message });
};

export const createTag: RequestHandler = async (req, res) => {
  try {
    const data = await service.createTag(req.body);
    res.status(201).json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const getTags: RequestHandler = async (_req, res) => {
  try {
    const data = await service.getTags();
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const getTagById: RequestHandler<IdParam> = async (req, res) => {
  try {
    const data = await service.getTagById(req.params.id);
    if (!data) return res.status(404).json({ error: "Tag not found" });
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const updateTag: RequestHandler<IdParam> = async (req, res) => {
  try {
    const data = await service.updateTag(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteTag: RequestHandler<IdParam> = async (req, res) => {
  try {
    const data = await service.deleteTag(req.params.id);
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteManyTags: RequestHandler = async (req, res) => {
  try {
    const { ids } = req.body;

    const result = await service.deleteManyTagsService(ids);

    return res.status(200).json({
      message: "Tags deleted successfully",
      deletedCount: result.count,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};