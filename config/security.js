import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import csrf from "csurf";
import session from "express-session";
import environment from "./environment.js";

export const setupSecurity = (app) => {
  // Cookie parser
  app.use(cookieParser(environment.cookieSecret));

  // Session configuration
  app.use(
    session({
      secret: environment.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: environment.isProduction,
        httpOnly: true,
        sameSite: environment.isProduction ? "strict" : "lax",
        maxAge: 24 * 60 * 60 * 1000,
      },
    })
  );

  // Helmet security headers
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

  // CORS configuration
  app.use(
    cors({
      origin: environment.allowedOrigins,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
    })
  );

  // CSRF Protection
  const csrfProtection = csrf({
    cookie: {
      key: "_csrf",
      secure: environment.isProduction,
      httpOnly: true,
      sameSite: environment.isProduction ? "strict" : "lax",
      maxAge: 3600,
    },
  });

  return { csrfProtection };
};

export default setupSecurity;