import { Router } from "express";
import * as ctrl from "../controllers/printerTag.controller";

const router = Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Printer Tags
 *   description: Assign and remove tags from printers
 *
 * /api/printers/{printerId}/tags:
 *   get:
 *     summary: Get all tags for a printer
 *     tags: [Printer Tags]
 *     parameters:
 *       - in: path
 *         name: printerId
 *         required: true
 *         schema:
 *           type: string
 *         example: "uuid-of-printer"
 *     responses:
 *       200:
 *         description: List of tags assigned to the printer
 *       404:
 *         description: Printer not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *   post:
 *     summary: Assign a tag to a printer
 *     tags: [Printer Tags]
 *     parameters:
 *       - in: path
 *         name: printerId
 *         required: true
 *         schema:
 *           type: string
 *         example: "uuid-of-printer"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tagId]
 *             properties:
 *               tagId: { type: string, example: "uuid-of-tag" }
 *     responses:
 *       201:
 *         description: Tag successfully assigned to printer
 *       404:
 *         description: Printer or tag not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Tag already assigned to this printer
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *   delete:
 *     summary: Delete multiple printer-tag associations
 *     tags: [Printer Tags]
 *     parameters:
 *       - in: path
 *         name: printerId
 *         required: true
 *         schema:
 *           type: string
 *         example: "uuid-of-printer"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pairs
 *             properties:
 *               pairs:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [printerId, tagId]
 *                   properties:
 *                     printerId: { type: string, example: "uuid-of-printer" }
 *                     tagId: { type: string, example: "uuid-of-tag" }
 *                 example:
 *                   - printerId: "uuid1"
 *                     tagId: "uuid-tag1"
 *                   - printerId: "uuid1"
 *                     tagId: "uuid-tag2"
 *     responses:
 *       200:
 *         description: Tags successfully removed from printers
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * /api/printers/{printerId}/tags/{tagId}:
 *   delete:
 *     summary: Remove a tag from a printer
 *     tags: [Printer Tags]
 *     parameters:
 *       - in: path
 *         name: printerId
 *         required: true
 *         schema:
 *           type: string
 *         example: "uuid-of-printer"
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: string
 *         example: "uuid-of-tag"
 *     responses:
 *       200:
 *         description: Tag successfully removed from printer
 *       404:
 *         description: Tag not assigned to this printer
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

router.get("/", ctrl.getTagsForPrinter);
router.post("/", ctrl.addTagToPrinter);
router.delete("/", ctrl.deleteManyPrinterTags);
router.delete("/:tagId", ctrl.removeTagFromPrinter);

export default router;