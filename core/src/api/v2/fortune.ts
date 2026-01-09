import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions } from "fastify";
import { StatusCodes } from "http-status-codes";
import { getFortune } from "../../cow/fortune.js";

const fortuneEndpoint: FastifyPluginAsync<FastifyPluginOptions> = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions,
) => {
  fastify.get(
    "/fortune",
    {
      schema: {
        summary: "Obtain a cookie",
        description:
          "Obtains a random fortune and returns its plain text, limited to printable characters only.",
        tags: ["Fortune"],
        response: {
          200: {
            type: "object",
            properties: {
              text: { type: "string" },
            },
          },
          500: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (req, rsp) =>
      getFortune()
        .then((fortune) => rsp.code(StatusCodes.OK).send({ text: fortune }))
        .catch((err) => rsp.code(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: err })),
  );
};

export default fortuneEndpoint;
