import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import compression from "compression";

// Import routes
import questionRoutes from "./routes/questions.js";
import healthRoutes from "./routes/health.js";
import csrfRoutes from "./routes/csrf.js";

// Import middleware
import { errorHandler, csrfErrorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimiter.js";

// Import configurations
import { setupSecurity } from "./config/security.js";
import { setupSwagger } from "./config/swagger.js";
import { AppError } from "./utils/AppError.js";

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
app.set("trust proxy", 1);

// Apply compression middleware
app.use(compression());

// Parse request bodies
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup security features (CORS, Helmet, CSRF, etc.)
const { csrfProtection } = setupSecurity(app);

// Setup API rate limiting
app.use("/api", apiLimiter);

// Setup Swagger documentation
setupSwagger(app);

// Routes
app.use("/health", healthRoutes);
app.use("/api/csrf-token", csrfProtection, csrfRoutes);

const readOnlyRoutes = express.Router();
app.use("/api/questions/public", readOnlyRoutes);
app.use("/api/questions", csrfProtection, questionRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the CQuizy API");
});

app.get('/favicon.ico', (req, res) => res.status(204).end());

// Handle 404 errors
app.all("*", notFoundHandler);

// Handle CSRF errors
app.use(csrfErrorHandler);

// Global error handler
app.use(errorHandler);

export default app;