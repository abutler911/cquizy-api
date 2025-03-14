export const environment = {
    nodeEnv: process.env.NODE_ENV || "development",
    isProduction: process.env.NODE_ENV === "production",
    port: process.env.PORT || 3000,
    mongoUri: process.env.MONGO_URI,
    cookieSecret: process.env.COOKIE_SECRET || "your-secret-key",
    sessionSecret: process.env.SESSION_SECRET || "your-session-secret",
    version: process.env.npm_package_version || "unknown",
    allowedOrigins: [
      "https://cquizy.com",
      "http://127.0.0.1:5500",
      "http://localhost:3000",
    ],
  };
  
  export default environment;