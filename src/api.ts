import express from "express";
import fs from "fs";
import { VERSION } from "./constants";
import { fortune } from "./fortune";
import { makeCow } from "./app";
import { Cow } from "./cow";
import bodyParser from "body-parser";
import { StatusCodes } from "http-status-codes";

export const runApi = async (cowDir: string) => {
  const app = express();
  const port: number = 80;

  // API methods
  const jsonParser = bodyParser.json();
  const apiRouter = express.Router();
  apiRouter.get("/version", (req, rsp) => {
    rsp.send({ version: VERSION ?? null });
  });
  apiRouter.get("/history", (req, rsp) => {
    fs.readdir(cowDir, (_, files) => {
      rsp.send(files);
    });
  });
  apiRouter.get("/fortune", async (req, rsp) => {
    rsp.send({ text: await fortune() });
  });
  apiRouter.post("/moo", jsonParser, async (req, rsp) => {
    const success = await makeCow(async (cow: Cow) => {
      cow.setText(req.body.text);
    });
    rsp.status(success ? StatusCodes.OK : StatusCodes.BAD_REQUEST).send();
  });
  app.use("/api/v1", apiRouter);

  // Static webinterface and file server for cow images
  app.use(express.static("src/static"));
  app.use("/cow", express.static(cowDir));

  app.listen(port, () => {
    console.log(`Webinterface/API listening on port ${port}.`);
  });
};
