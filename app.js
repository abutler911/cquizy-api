import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import questionRoutes from "./routes/questions.js";
import bodyParser from "body-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import winston from "winston";
import cookieParser from "cookie-parser";
import csrf from "csurf";
import { body, validationResult } from "express-validator";
import os from "os";
import compression from "compression";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import session from "express-session";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
app.set("trust proxy", 1);

const allowedOrigins = [
  "https://cquizy.com",
  "http://127.0.0.1:5500",
  "http://localhost:3000",
];

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after an hour!",
});

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
  ],
});

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "CQuizy API",
      version: "1.0.0",
      description: "API documentation for CQuizy - A Quiz Application",
      contact: {
        name: "API Support",
        url: "https://cquizy.com/support",
        email: "support@cquizy.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://api.cquizy.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        csrfToken: {
          type: "apiKey",
          in: "header",
          name: "X-CSRF-Token",
        },
      },
    },
  },
  apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

app.use(compression());

app.use(cookieParser(process.env.COOKIE_SECRET || "your-secret-key"));

const isProduction = process.env.NODE_ENV === "production";

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction,
      httpOnly: true,
      sameSite: isProduction ? "strict" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: { policy: "require-corp" },
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "same-origin" },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: "deny" },
    hsts: {
      maxAge: 15552000,
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xssFilter: true,
    noSniff: true,
  })
);

const csrfProtection = csrf({
  cookie: {
    key: "_csrf",
    secure: isProduction,
    httpOnly: true,
    sameSite: isProduction ? "strict" : "lax",
    maxAge: 3600, // 1 hour
  },
});

app.use("/api", apiLimiter);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  })
);

app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const validate = (validations) => {
  return async (req, res, next) => {
    try {
      await Promise.all(validations.map((validation) => validation.run(req)));

      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }

      return res.status(400).json({
        status: "error",
        errors: errors.array().map((err) => ({
          field: err.param,
          message: err.msg,
        })),
      });
    } catch (error) {
      next(error);
    }
  };
};

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB..."))
  .catch((err) => console.error("❌ Error connecting to MongoDB:", err));

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocs, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "CQuizy API Documentation",
  })
);

app.get("/health", (req, res) => {
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
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "unknown",
    },

    services: {
      database: {
        status:
          mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        name: mongoose.connection.name || "unknown",
      },
    },
  };

  if (mongoose.connection.readyState !== 1) {
    healthcheck.status = "DOWN";
    healthcheck.services.database.status = "disconnected";
    return res.status(503).json(healthcheck);
  }

  res.status(200).json(healthcheck);
});

app.get("/api/csrf-token", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

const readOnlyRoutes = express.Router();
app.use("/api/questions/public", readOnlyRoutes);

app.use("/api/questions", csrfProtection, questionRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the CQuizy API");
});

app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    logger.error("CSRF attack detected");
    return res.status(403).json({ error: "Invalid or missing CSRF token" });
  }
  next(err);
});

app.use((err, req, res, next) => {
  logger.error(err.message);
  res.status(500).json({ error: "Something went wrong!" });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 CQuizy API is running on http://localhost:${PORT}`);
});

const gracefulShutdown = (signal) => {
  console.log(`${signal} signal received: closing HTTP server`);

  server.close(() => {
    console.log("HTTP server closed");

    mongoose.connection
      .close(false)
      .then(() => {
        console.log("MongoDB connection closed");
        process.exit(0);
      })
      .catch((err) => {
        console.error("Error closing MongoDB connection:", err);
        process.exit(1);
      });

    setTimeout(() => {
      console.error(
        "Could not close connections in time, forcefully shutting down"
      );
      process.exit(1);
    }, 10000);
  });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

export { validate };
