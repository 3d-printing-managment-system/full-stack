import { Router } from "express";
import * as ctrl from "../controllers/part.controller";
import multer from "multer";
import { uploadToCloudinary } from "../../lib/cloudinary";

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

// router.post("/upload-file", upload.single("file"), async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ error: "No file uploaded" });

//     const result = await uploadToDrive(
//       req.file,
//       process.env.GOOGLE_DRIVE_FOLDER_ID!,
//     );

//     res.json({ fileUrl: result.fileUrl, downloadUrl: result.downloadUrl });
//   } catch (error) {
//     console.error("Drive upload error:", error);
//     res.status(500).json({ error: "Failed to upload to Google Drive" });
//   }
// });

router.post("/upload-file", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    console.log(
      "File received:",
      req.file.originalname,
      req.file.mimetype,
      req.file.size,
    ); // 👈 add this

    const result = await uploadToCloudinary(req.file);
    res.json({ fileUrl: result.fileUrl });
  } catch (error) {
    console.error("Cloudinary upload error:", error); // check terminal for the actual error
    res
      .status(500)
      .json({ error: "Failed to upload file", detail: error?.message }); // 👈 return detail
  }
});

router.post("/", ctrl.create);
router.get("/", ctrl.getAll);
router.delete("/", ctrl.deleteMany);
router.get("/:id", ctrl.getById);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);
/**
 * @swagger
 * tags:
 *   name: Parts
 *   description: Part/file management
 *
 * /api/parts:
 *   get:
 *     summary: Get all parts
 *     tags: [Parts]
 *     responses:
 *       200:
 *         description: List of parts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Part'
 *   post:
 *     summary: Create a new part
 *     tags: [Parts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [image, title, duration, nozzleDiameter, fileUrl, filamentUsed]
 *             properties:
 *               image: { type: string, example: "https://example.com/bracket.png" }
 *               title: { type: string, example: "Bracket v1" }
 *               duration: { type: integer, example: 120 }
 *               nozzleDiameter: { type: number, example: 0.4 }
 *               fileUrl: { type: string, example: "https://example.com/bracket.stl" }
 *               filamentUsed: { type: number, example: 15.5 }
 *     responses:
 *       201:
 *         description: Part created
 *   delete:
 *     summary: Delete multiple parts
 *     tags: [Parts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["uuid1", "uuid2", "uuid3"]
 *     responses:
 *       200:
 *         description: Parts deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 deletedCount:
 *                   type: number
 *       400:
 *         description: Bad request
 *
 * /api/parts/{id}:
 *   get:
 *     summary: Get part by ID
 *     tags: [Parts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Part found
 *       404:
 *         description: Part not found
 *   put:
 *     summary: Update a part
 *     tags: [Parts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Part'
 *     responses:
 *       200:
 *         description: Part updated
 *   delete:
 *     summary: Delete a part and its related jobs
 *     tags: [Parts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Part deleted
 *       404:
 *         description: Part not found
 */
export default router;
