import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions } from "fastify";
import { StatusCodes } from "http-status-codes";

const configEndpoint: FastifyPluginAsync<FastifyPluginOptions> = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions,
) => {
  fastify.get(
    "/config",
    {
      schema: {
        summary: "Get current configuration",
        description: "Retrieves the current CowPhone configuration.",
        tags: ["Config"],
        response: {
          200: {
            type: "string",
          },
        },
      },
    },
    (req, rsp) => {
      // TODO
      rsp.code(StatusCodes.OK).send("tbd");
    },
  );
};

export default configEndpoint;
