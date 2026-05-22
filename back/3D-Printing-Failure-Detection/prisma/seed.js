import { InventoryType, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // ===================== CLEAN OLD DATA (IMPORTANT) =====================
  await prisma.printerTag.deleteMany();

  await prisma.commandLog.deleteMany();
  await prisma.maintenanceLog.deleteMany();
  await prisma.printJob.deleteMany();
  await prisma.inventory.deleteMany();

  await prisma.tag.deleteMany();
  await prisma.part.deleteMany();
  await prisma.filamentProfile.deleteMany();
  await prisma.gcodeCommand.deleteMany();
  await prisma.printer.deleteMany();

  // ===================== PRINTERS =====================
  const printers = await Promise.all(
    Array.from({ length: 6 }).map((_, i) =>
      prisma.printer.create({
        data: {
          id: `printer-${i + 1}`,
          name: `Printer ${i + 1}`,
          model: `Model ${i + 1}`,
          status: "PRINTING",
          ipAddress: `192.168.1.${100 + i}`,
          nozzleDiameter: 0.4,
          bedTemp: 60,
          nozzleTemp: 200,
          cameraLink: `http://camera${i + 1}.local`,
          printerType: "Bambulab",
        },
      }),
    ),
  );

  // ===================== PRINT FILE PREVIEWS (PARTS) =====================
  const parts = await Promise.all(
    [
      {
        img: "img1.jpg",
        title: "Gear Prototype",
        duration: 120,
        nozzle: 0.4,
        filamentUsed: 23,
      },
      {
        img: "img2.jpg",
        title: "Phone Stand",
        duration: 95,
        nozzle: 0.4,
        filamentUsed: 23,
      },
      {
        img: "img3.jpg",
        title: "Mini Vase",
        duration: 60,
        nozzle: 0.2,
        filamentUsed: 23,
      },
      {
        img: "img4.jpg",
        title: "Drone Frame",
        duration: 240,
        nozzle: 0.6,
        filamentUsed: 23,
      },
      {
        img: "img5.jpg",
        title: "Key Holder",
        duration: 45,
        nozzle: 0.4,
        filamentUsed: 23,
      },
    ].map((p) =>
      prisma.part.create({
        data: {
          image: `/uploads/previews/${p.img}`,
          title: p.title,
          duration: p.duration,
          nozzleDiameter: p.nozzle,
          filamentUsed: p.filamentUsed,
        },
      }),
    ),
  );

  // ===================== TAGS =====================
  const tags = await Promise.all(
    ["Fast", "High-Precision", "Test", "Lab", "Broken", "Maintenance"].map(
      (t, i) =>
        prisma.tag.create({
          data: {
            id: `tag-${i + 1}`,
            name: t,
            color: "#FFAA00",
          },
        }),
    ),
  );

  // ===================== GCODE COMMANDS =====================
  const commands = await Promise.all(
    Array.from({ length: 6 }).map((_, i) =>
      prisma.gcodeCommand.create({
        data: {
          id: `cmd-${i + 1}`,
          name: `Command ${i + 1}`,
          command: `G1 X${i * 10} Y${i * 5}`,
        },
      }),
    ),
  );

  // ===================== MAINTENANCE =====================
  await Promise.all(
    printers.map((p, i) =>
      prisma.maintenanceLog.create({
        data: {
          id: `maint-${i + 1}`,
          printerId: p.id,
          type: "ROUTINE",
          description: `Routine check for printer ${i + 1}`,
          cost: 10 + i,
        },
      }),
    ),
  );

  // ===================== FILAMENT PROFILES =====================
  const profiles = await Promise.all(
    ["PLA", "ABS", "PETG", "TPU", "PLA_PLUS", "ASA"].map((m, i) =>
      prisma.filamentProfile.create({
        data: {
          id: `profile-${i + 1}`,
          material: m,
          name: `${m} Profile`,
          color: "Red",
          roleSize: 1.75,
        },
      }),
    ),
  );

  // ===================== INVENTORY =====================
  await Promise.all(
    profiles.flatMap((profile, i) =>
      Array.from({ length: 2 }).map((_, j) =>
        prisma.inventory.create({
          data: {
            id: `inventory-${profile.id}-${j + 1}`,
            orderNumber: `ORD-${i + 1}-${j + 1}`,
            updateType: InventoryType.ORDER, // or REDUCTION
            quantity: 5 + j * 2,
            totalCost: 10.5 * (5 + j * 2),
            date: new Date(),
            profileId: profile.id,
          },
        }),
      ),
    ),
  );

  // ===================== PRINT JOBS =====================
  await Promise.all(
    Array.from({ length: 5 }).map((_, i) =>
      prisma.printJob.create({
        data: {
          id: `job-${i + 1}`,

          printerId: printers[0].id,
          fileId: parts[0].id,
          profileId: profiles[0].id,

          status: "QUEUED",
          progress: 60,

          estimatedTime: 120 + i * 10,
          printerSelectionMode: "NEXT_AVAILABLE_WITH_SPECIFIC_TAG",

          queuePosition: i + 1,

          requiredTagIds: [],

          startedAt: null,
          finishedAt: null,

          createdAt: new Date(),
        },
      }),
    ),
  );

  // ===================== PRINTER TAG RELATIONS =====================
  await Promise.all([
    prisma.printerTag.createMany({
      data: [
        { printerId: printers[0].id, tagId: tags[0].id },
        { printerId: printers[0].id, tagId: tags[1].id },
        { printerId: printers[1].id, tagId: tags[1].id },
        { printerId: printers[2].id, tagId: tags[2].id },
        { printerId: printers[3].id, tagId: tags[3].id },
        { printerId: printers[4].id, tagId: tags[4].id },
        { printerId: printers[5].id, tagId: tags[5].id },
      ],
      skipDuplicates: true,
    }),
  ]);

  console.log("🌱 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
