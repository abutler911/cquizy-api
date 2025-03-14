import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

export const setupSwagger = (app) => {
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

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocs, {
      explorer: true,
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "CQuizy API Documentation",
    })
  );
};

export default setupSwagger;