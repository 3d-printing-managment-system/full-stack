import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  Adjustment,
  GCodeInfo,
  InventoryItemBeforeJoining,
  Profile,
} from "./types";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const getProfileCostPerKg = (
  profileId: string,
  inventory: any[],
): number => {
  const orders = inventory.filter(
    (item) => item.profileId === profileId && item.updateType === "ORDER",
  );

  if (orders.length === 0) return 0; // no order yet

  return orders[0].cost_per_kg;
};

export function calculateStock(inventory: InventoryItemBeforeJoining[]) {
  return inventory.reduce((total, item) => {
    if (item.updateType === "ORDER") {
      return total + item.quantity;
    }

    if (item.updateType === "REDUCTION") {
      return total - item.quantity;
    }

    return total;
  }, 0);
}

export function canReduceStock(
  profileId: string,
  quantityToReduce: number,
  inventory: InventoryItemBeforeJoining[],
): boolean {
  const currentStock = calculateStock(inventory);

  return currentStock - quantityToReduce >= 0;
}

export function getProfileCostPerKgReduction(
  name: string | undefined,
  inventory: Adjustment[],
): number {
  const lastOrder = [...inventory].find(
    (item) =>
      item.material_profile.name === name && item.updateType === "ORDER",
  );

  return lastOrder?.cost_per_kg ?? 0;
}

export function parseInfo(text) {
  const lines = text.split("\n");
  console.log(lines);

  const data: GCodeInfo = {
    raw: text,
    lines,
    lineCount: lines.length,
    nozzle_diameter: "unknown",
    nozzle_temperature: "unknown",
    filament_used: "unknown",
    estimated_printing_time: "unknown",
  };

  lines.forEach((line) => {
    const normalized = line.toLowerCase().replace(/_/g, " "); // lowercase + replace underscores
    console.log(normalized);

    if (normalized.includes("nozzle diameter")) {
      data.nozzle_diameter = line.split("=")[1]?.trim() ?? "Unknown";
      console.log(data.nozzle_diameter);
    }

    if (normalized.includes("nozzle temperature")) {
      data.nozzle_temperature = line.split("=")[1]?.trim() ?? "Unknown";
    }

    if (normalized.includes("filament used")) {
      data.filament_used = line.split("=")[1]?.trim() ?? "Unknown";
    }

    if (normalized.includes("estimated printing time")) {
      data.estimated_printing_time = line.split("=")[1]?.trim() ?? "Unknown";
    }
  });

  return data;
}

export function formatToDMY(dateStr: string) {
  const date = new Date(dateStr);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}
export function parseDate(dateStr: string) {
  if (!dateStr) return new Date();

  // 🔷 Case 1: ISO format (2026-04-26T21:58:09.514Z)
  if (dateStr.includes("T") || dateStr.includes("Z")) {
    const isoDate = new Date(dateStr);
    return isNaN(isoDate.getTime()) ? new Date() : isoDate;
  }

  // 🔷 Case 2: DMY format (dd/MM/yyyy)
  if (dateStr.includes("/")) {
    const [day, month, year] = dateStr.split("/").map(Number);
    const dmyDate = new Date(year, month - 1, day);
    return isNaN(dmyDate.getTime()) ? new Date() : dmyDate;
  }

  // 🔷 Fallback
  return new Date();
}

export function generateId(updateType: "ORDER" | "REDUCTION") {
  const random = Math.floor(1000 + Math.random() * 9000); // 4-digit number
  return updateType === "ORDER" ? `ord${random}` : `red${random}`;
}

export function transformInventoryToAdjustments(
  inventory: any[],
  profiles: Profile[],
): Adjustment[] {
  return inventory.map((item) => {
    const profile = profiles.find((p) => p.id === item.profileId);

    return {
      material_profile: {
        name: profile?.name ?? "",
        material: profile?.material ?? "PLA",
        color: profile?.color ?? "#000",
        roleSize: profile?.roleSize ?? 0,
      },
      orderNumber: item.orderNumber,
      updateType: item.updateType,
      quantity: item.quantity,
      totalCost: item.totalCost ?? 0,
      cost_per_kg: item.cost_per_kg ?? 0,
      date: item.date,
    };
  });
}

export function parseDurationToSeconds(timeString: string): number {
  if (!timeString || typeof timeString !== "string") return 0;

  const match = timeString.match(/(?:(\d+)h)?\s*(?:(\d+)m)?\s*(?:(\d+)s)?/);

  if (!match) return 0;

  const hours: number = parseInt(match[1] || "0", 10);
  const minutes: number = parseInt(match[2] || "0", 10);
  const seconds: number = parseInt(match[3] || "0", 10);

  return hours * 3600 + minutes * 60 + seconds;
}

export function formatSecondsToDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return "0s";
  }

  const hours: number = Math.floor(totalSeconds / 3600);
  const minutes: number = Math.floor((totalSeconds % 3600) / 60);
  const seconds: number = totalSeconds % 60;

  const parts: string[] = [];

  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

  return parts.join(" ");
}

export function formatSecondsToDurationBetter(totalSeconds: number): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}
