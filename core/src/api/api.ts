import { fastifySwagger } from "@fastify/swagger";
import { fastifySwaggerUi } from "@fastify/swagger-ui";
import fastify from "fastify";
import { FTP_SERVER, PROD } from "../config/environment.js";
import versionEndpoint from "./v1/version.js";
import configEndpoint from "./v2/config.js";
import cowEndpoint from "./v2/cow.js";
import fortuneEndpoint from "./v2/fortune.js";

export const runApi = async (cowDir: string) => {
  const app = fastify({ logger: false });

  // Register Swagger for API spec (must be registered before any endpoints)
  app.register(fastifySwagger, {
    swagger: {
      info: {
        title: "CowPhone API",
        description: "Documentation on how to RESTfully create and interact with some cow powers.",
        version: "2.0.0",
      },
    },
  });

  // Register API endpoints
  app.register(versionEndpoint, { prefix: "/api/v1" });
  app.register(configEndpoint, { prefix: "/api/v2" });
  app.register(cowEndpoint, { prefix: "/api/v2" });
  app.register(fortuneEndpoint, { prefix: "/api/v2" });

  // Register Swagger UI (must happen at the end)
  app.register(fastifySwaggerUi, {
    routePrefix: "/swagger",
    uiConfig: {
      docExpansion: "list",
    },
    staticCSP: false,
  });

  app.ready();

  // Use Docker internal port when productive
  const port: number = PROD ? 80 : 50080;
  const host: string = FTP_SERVER.host;
  try {
    await app.listen({ port: port, host: "0.0.0.0" });
    console.log("API and web interface are listening.", {
      webinterface: `http://${host}:${port}/`,
      swagger_ui: `http://${host}:${port}/swagger`,
    });
  } catch (err) {
    app.log.error(err);
  }
};
