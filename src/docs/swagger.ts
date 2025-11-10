import swaggerJsdoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: { title: "Flowers API", version: "1.0.0" },
  },
  apis: ["./src/routes/**/*.ts"],
});
