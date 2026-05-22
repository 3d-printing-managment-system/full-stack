import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "3D Printing API",
      version: "1.0.0",
      description: "API documentation for the 3D printing backend",
    },
    servers: [
      {
        url: "localhost:3000",
        description: "Local server",
      },
    ],
    components: {
      schemas: {
        Printer: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            model: { type: "string" },
            status: { type: "string", enum: ["IDLE", "PRINTING", "PAUSED", "OFFLINE"] },
            ipAddress: { type: "string" },
            nozzleDiameter: { type: "number" },
            bedTemp: { type: "number" },
            nozzleTemp: { type: "number" },
            cameraLink: { type: "string" },
            printerType: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Tag: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            color: { type: "string", nullable: true },
          },
        },
        PrinterTag: {
          type: "object",
          properties: {
            printerId: { type: "string", format: "uuid" },
            tagId: { type: "string", format: "uuid" },
            printer: { $ref: "#/components/schemas/Printer" },
            tag: { $ref: "#/components/schemas/Tag" },
          },
        },
        Part: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            image: { type: "string" },
            title: { type: "string" },
            duration: { type: "integer" },
            nozzleDiameter: { type: "number" },
            filamentUsed: { type: "number" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        PrintJob: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            printerId: { type: "string" },
            fileId: { type: "string" },
            status: { type: "string", enum: ["QUEUED", "PRINTING", "PAUSED", "DONE", "FAILED", "CANCELLED"] },
            progress: { type: "integer", minimum: 0, maximum: 100 },
            startedAt: { type: "string", format: "date-time", nullable: true },
            finishedAt: { type: "string", format: "date-time", nullable: true },
            estimatedTime: { type: "integer", nullable: true },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        FilamentProfile: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            material: { type: "string", enum: ["PLA", "PLA_PLUS", "ABS", "PETG", "TPU", "ASA"] },
            name: { type: "string" },
            color: { type: "string" },
            roleSize: { type: "number" },
          },
        },
        Inventory: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            orderNumber: { type: "string" },
            updateType: { type: "string", enum: ["ORDER", "REDUCTION"] },
            quantity: { type: "integer" },
            totalCost: { type: "number", nullable: true },
            date: { type: "string", format: "date-time" },
            profileId: { type: "string" },
          },
        },
        GcodeCommand: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            command: { type: "string" },
          },
        },
        CommandLog: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            printerId: { type: "string" },
            commandId: { type: "string" },
            response: { type: "string", nullable: true },
            status: { type: "string", enum: ["SENT", "SUCCESS", "ERROR"] },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        MaintenanceLog: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            printerId: { type: "string" },
            type: { type: "string", enum: ["REPAIR", "ROUTINE", "UPGRADE"] },
            description: { type: "string" },
            cost: { type: "number", nullable: true },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);