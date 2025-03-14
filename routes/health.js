import express from "express";
import os from "os";
import { getConnectionStatus } from "../config/database.js";
import environment from "../config/environment.js";

const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Get API health status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is running properly
 *       503:
 *         description: API is running but database is disconnected
 */
router.get("/", (req, res) => {
  const healthcheck = {
    status: "UP",
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())} seconds`,

    system: {
      memory: {
        free: `${Math.round(os.freemem() / 1024 / 1024)} MB`,
        total: `${Math.round(os.totalmem() / 1024 / 1024)} MB`,
      },
      cpu: os.cpus().length,
      platform: os.platform(),
      loadAvg: os.loadavg(),
    },

    application: {
      environment: environment.nodeEnv,
      version: environment.version,
    },

    services: {
      database: getConnectionStatus(),
    },
  };

  if (healthcheck.services.database.status !== "connected") {
    healthcheck.status = "DOWN";
    return res.status(503).json(healthcheck);
  }

  res.status(200).json(healthcheck);
});

export default router;