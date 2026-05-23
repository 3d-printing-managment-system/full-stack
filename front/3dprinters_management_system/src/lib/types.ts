export type InventoryItemBeforeJoining = {
  id: string;
  orderNumber: string;
  profileId: string;
  updateType: "ORDER" | "REDUCTION";
  quantity: number;
  totalCost?: number;
  date: string;
  cost_per_kg?: number;
};

export type Profile = {
  id: string;
  material: "PLA" | "PLA+" | "ABS" | "PETG" | "TPU" | "ASA";
  name: string;
  color: string;
  roleSize: number;
  cost_per_kg?: number;
  inventoryQuantity: number;
  inventory: InventoryItemBeforeJoining[];
};

type MaterialProfile = {
  name: string;
  color: string;
  material: string;
  roleSize: number;
};
export type Adjustment = {
  orderNumber: string;
  updateType: "ORDER" | "REDUCTION";
  material_profile: MaterialProfile;
  quantity: number;
  totalCost: number;
  cost_per_kg: number;
  date: string;
};

export type PrintModelFile = {
  id: string;
  image: string;
  title: string;
  duration: number;
  nozzleDiameter: number;
  filamentUsed: number;
  createdAt: string;
};

export type PrintModelFileInQueue = {
  id: string;
  image: string;
  title: string;
  duration: number;
  state:
    | "QUEUED"
    | "PRINTING"
    | "PAUSED"
    | "DONE"
    | "FAILED"
    | "CANCELLED"
    | "DISPATCHED";
  matched_printer: string;
  printer_selection_mode:
    | "NEXT_AVAILABLE_WITH_SPECIFIC_TAG"
    | "SPECIFIC_PRINTER";
  adding_date: string;
};

export type QueueFile = {
  id: string;
  printerId: string | null;
  fileId: string;
  profileId: string;
  status: "QUEUED" | "PRINTING" | "PAUSED" | "DONE" | "FAILED" | "CANCELLED";
  progress: number;
  printerSelectionMode: "NEXT_AVAILABLE_WITH_SPECIFIC_TAG" | "SPECIFIC_PRINTER";
  estimatedTime: number; // seconds
  queuePosition: number;
  part: PrintModelFile;
  profile: Profile;
  requiredTagIds: string[];
  startedAt: Date | null;
  finishedAt: Date | null;
  createdAt: Date;
};

export type GCodeInfo = {
  raw: string;
  lines: string[];
  lineCount: number;
  nozzle_diameter: string;
  nozzle_temperature: string;
  filament_used: string;
  estimated_printing_time: string;
};

export type Printer = {
  id: string;
  name: string;
  printerType: string;
  model: string;
  cameraLink: string;
  status: "IDLE" | "PRINTING" | "PAUSED" | "OFFLINE";
  ipAddress: string;
  nozzleDiameter: number;
  bedTemp: number;
  nozzleTemp: number;
  createdAt: string; // Or Date
  updatedAt: string; // Or Date
  tags: TagsPrinterRelation[];
  jobs: QueueFile[];
};

export type Tags = {
  id: string;
  name: string;
  color: string;
};

export type TagsPrinterRelation = {
  printerId: string;
  tagId: string;
};

export type Command = {
  id: string;
  command: string;
  name: string;
  CommandLog: CommandLog[];
};

export type CommandLog = {
  commandId: string;
  printerId: string;
  rawCommand: string;
  response: string;
  status: "SENT" | "SUCCESS" | "ERROR";
  createdAt: string;
};

export type StepKey =
  | "filament"
  | "inventory"
  | "printFile"
  | "printer"
  | "firstPrint";

export const statusStyles: Record<string, string> = {
  QUEUED: "bg-gray-100 text-gray-700",
  PRINTING: "bg-blue-100 text-blue-700",
  PAUSED: "bg-yellow-100 text-yellow-700",
  DONE: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  CANCELLED: "bg-zinc-200 text-zinc-700",
  DISPATCHED: "bg-purple-100 text-purple-700",
};
