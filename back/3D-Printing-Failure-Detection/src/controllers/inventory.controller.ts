import { RequestHandler } from "express";
import * as service from "../services/inventory.service";

type IdParam = { id: string };
type ProfileParam = { profileId: string };

const handleError = (res: any, error: unknown) => {
  const message = error instanceof Error ? error.message : "Internal server error";
  const status =
    message.includes("not found") ? 404 :
    message.includes("Invalid") || message.includes("must") ? 400 :
    500;
  res.status(status).json({ error: message });
};

export const createInventory: RequestHandler = async (req, res) => {
  try {
    const data = await service.createInventory(req.body);
    res.status(201).json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const getInventories: RequestHandler = async (_req, res) => {
  try {
    const data = await service.getInventories();
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const getInventoryById: RequestHandler<IdParam> = async (req, res) => {
  try {
    const data = await service.getInventoryById(req.params.id);
    if (!data) return res.status(404).json({ error: "Inventory not found" });
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const getInventoriesByProfile: RequestHandler<ProfileParam> = async (req, res) => {
  try {
    const data = await service.getInventoriesByProfile(req.params.profileId);
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const updateInventory: RequestHandler<IdParam> = async (req, res) => {
  try {
    const data = await service.updateInventory(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteInventory: RequestHandler<IdParam> = async (req, res) => {
  try {
    const data = await service.deleteInventory(req.params.id);
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteManyInventories: RequestHandler = async (req, res) => {
  try {
    const { ids } = req.body;

    const result = await service.deleteManyInventoriesService(ids);

    return res.status(200).json({
      message: "Inventories deleted successfully",
      deletedCount: result.count,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};