import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions } from "fastify";
import { StatusCodes } from "http-status-codes";
import { VERSION } from "../../config/environment.js";

const versionEndpoint: FastifyPluginAsync<FastifyPluginOptions> = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions,
) => {
  fastify.get(
    "/version",
    {
      schema: {
        summary: "Get current version",
        description: "Retrieves the currently running version of CowPhone.",
        tags: ["General"],
        response: {
          200: {
            type: "object",
            properties: {
              CowPhone: { type: "string" },
            },
          },
        },
      },
    },
    (req, rsp) => {
      rsp.code(StatusCodes.OK).send({ CowPhone: VERSION || null });
    },
  );
};

export default versionEndpoint;
