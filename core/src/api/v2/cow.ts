import {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import fs from "fs";
import { StatusCodes } from "http-status-codes";
import { FromSchema } from "json-schema-to-ts";
import { generateAndApplyCow } from "../../app.js";
import { Cow } from "../../cow/cow.js";
import { getFortuneForCow } from "../../cow/fortune.js";

const cowEndpoint: FastifyPluginAsync<FastifyPluginOptions> = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions,
) => {
  fastify.get(
    "/cow/history",
    {
      schema: {
        summary: "Get list of generated Cows",
        description: "Lists all cows and their properties, which are already present in the barn.",
        tags: ["Cow Powers"],
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                generated_at: { type: "string", format: "date-time" },
              },
            },
          },
        },
      },
    },
    (req, rsp) => {
      const cowDir = "./";
      fs.readdir(cowDir, (error, files) => {
        const cows = files?.filter((file) => !file.startsWith(".")) ?? [];
        rsp.send(cows.sort().reverse());
      });
    },
  );

  fastify.get(
    "/cow/:id",
    {
      schema: {
        summary: "Get a specific Cow image",
        description: "Retrieve a specific Cow given by ID as bitmap or PNG image.",
        tags: ["Cow Powers"],
        response: {
          200: {
            type: "string",
            format: "binary",
            content: {
              "image/bmp": {
                schema: {
                  type: "string",
                  format: "binary",
                },
              },
              "image/png": {
                schema: {
                  type: "string",
                  format: "binary",
                },
              },
            },
          },
        },
      },
    },
    (req, rsp) => {
      const cowDir = "./";
      fs.readdir(cowDir, (error, files) => {
        const cows = files?.filter((file) => !file.startsWith(".")) ?? [];
        rsp.send(cows.sort().reverse());
      });
    },
  );

  const cowGenerateBodySchema = {
    type: "object",
    required: ["type", "cow", "text"],
    properties: {
      type: { type: "string", enum: ["os40", "os60"] },
      cow: { type: "string" },
      text: { type: "string" },
    },
  } as const;
  type CowGenerateBody = FromSchema<typeof cowGenerateBodySchema>;

  fastify.post(
    "/cow/generate",
    {
      schema: {
        summary: "Create a new Cow",
        description:
          "Generates a Cow image with the given text and properties, which is internally stored in our barn and can then be retrieved by its ID.",
        tags: ["Cow Powers"],
        body: {
          type: "object",
          required: ["type", "cow", "text"],
          properties: {
            type: { type: "string", enum: ["os40", "os60"] },
            cow: { type: "string" },
            text: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "string" },
            },
          },
          400: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (req: FastifyRequest<{ Body: CowGenerateBody }>, rsp: FastifyReply) =>
      Cow.make("os60", "Cow").then((cow) => {
        // cow.textCentered = Boolean(req.body.centered);
        // cow.textTrimmed = Boolean(req.body.trimmed);
        if (!cow.tryToSpeak(req.body.text ?? "")) {
          rsp.code(StatusCodes.BAD_REQUEST).send();
          return;
        }
        generateAndApplyCow(cow).then(
          () => {
            rsp.status(StatusCodes.OK).send();
          },
          () => {
            rsp.status(StatusCodes.BAD_REQUEST).send();
          },
        );
      }),
  );

  fastify.put(
    "/cow/upload",
    {
      schema: {
        summary: "Upload a Cow to the phone",
        description: "Uploads a Cow image to an OpenStage phone, updating its custom logo.",
        tags: ["Cow Powers"],
        body: {
          type: "object",
          required: ["cow_id"],
          properties: {
            cow_id: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
          400: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (req, rsp) => {
      Cow.makeRandom("os60").then((cow) => {
        getFortuneForCow(cow).then(() => {
          generateAndApplyCow(cow).then(
            () => {
              rsp.status(StatusCodes.OK).send();
            },
            () => {
              rsp.status(StatusCodes.BAD_REQUEST).send();
            },
          );
        });
      });
    },
  );

  fastify.delete(
    "/cow/reset",
    {
      schema: {
        summary: "Reset a phone's logo",
        description: "Deletes a cow and restores the default logo on our OpenStage desktop phone.",
        tags: ["Cow Powers"],
        body: {
          type: "object",
          required: ["type"],
          properties: {
            type: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
          400: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    (req, rsp) => {
      // TODO
      rsp.send("tbd");
    },
  );
};

export default cowEndpoint;
