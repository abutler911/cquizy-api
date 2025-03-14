import express from "express";

const router = express.Router();

/**
 * @swagger
 * /api/csrf-token:
 *   get:
 *     summary: Get CSRF token
 *     tags: [Security]
 *     responses:
 *       200:
 *         description: CSRF token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 csrfToken:
 *                   type: string
 */
router.get("/", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

export default router;