import bodyParser from "body-parser";
import express from "express";
import fs from "fs";
import { StatusCodes } from "http-status-codes";
import { makeCow } from "./app";
import { CRON_SCHEDULE, PROD, VERSION } from "./constants";
import { Cow } from "./cow";
import { getFortune, getFortuneForCow } from "./fortune";

export const runApi = async (cowDir: string) => {
  const app = express();

  // API methods
  const jsonParser = bodyParser.json();
  const apiRouter = express.Router();
  apiRouter.get("/info", (req, rsp) => {
    rsp.send({ version: VERSION || null, schedule: CRON_SCHEDULE });
  });
  apiRouter.get("/history", (req, rsp) => {
    fs.readdir(cowDir, (error, files) => {
      const cows = files?.filter((file) => !file.startsWith(".")) ?? [];
      rsp.send(cows.sort().reverse());
    });
  });
  apiRouter.get("/fortune", async (req, rsp) => {
    rsp.send({ text: await getFortune() });
  });
  apiRouter.post("/moo", jsonParser, async (req, rsp) => {
    let success: boolean = false;
    if (req.body.text) {
      success = await makeCow(async (cow: Cow) => {
        cow.textCentered = Boolean(req.body.centered);
        cow.textTrimmed = Boolean(req.body.trimmed);
        cow.setText(req.body.text ?? "");
      });
    }
    rsp.status(success ? StatusCodes.OK : StatusCodes.BAD_REQUEST).send();
  });
  apiRouter.post("/update", jsonParser, async (req, rsp) => {
    rsp.status((await makeCow(getFortuneForCow)) ? StatusCodes.OK : StatusCodes.BAD_REQUEST).send();
  });
  app.use("/api/v1", apiRouter);

  // Static web interface and file server for cow images
  app.use(express.static("./static/api"));
  app.use("/cow", express.static(cowDir));

  // Use Docker internal port when productive
  const port: number = PROD ? 80 : 50080;
  app.listen(port, () => {
    console.log("API and web interface are listening.", { port: port });
  });
};
