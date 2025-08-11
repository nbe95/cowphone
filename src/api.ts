import bodyParser from "body-parser";
import express from "express";
import fs from "fs";
import { StatusCodes } from "http-status-codes";
import { generateAndApplyCow } from "./app";
import { CRON_SCHEDULE, PROD, VERSION } from "./config";
import { Cow } from "./cow/cow";
import { getFortune, getFortuneForCow as setFortuneForCow } from "./cow/fortune";

export const runApi = async (cowDir: string) => {
  const app = express();

  // API methods
  const jsonParser = bodyParser.json();
  const apiRouter = express.Router();
  apiRouter.get("/info", (req, rsp) => {
    rsp.json({ version: VERSION || null, cowTypes: ["Cow"], updateSchedule: CRON_SCHEDULE });
  });
  apiRouter.get("/history", (req, rsp) => {
    fs.readdir(cowDir, (error, files) => {
      const cows = files?.filter((file) => !file.startsWith(".")) ?? [];
      rsp.json(cows.sort().reverse());
    });
  });
  apiRouter.get("/fortune", async (req, rsp) => {
    rsp.json({ text: await getFortune() });
  });
  apiRouter.post("/moo", jsonParser, async (req, rsp) => {
    // const cow = new Cow(req.body.type ?? "");
    const cow: Cow = new Cow("os60", "Cow");
    await cow.init();
    // cow.textCentered = Boolean(req.body.centered);
    // cow.textTrimmed = Boolean(req.body.trimmed);
    let success: boolean = cow.tryToSpeak(req.body.text ?? "");
    if (success) {
      success = await generateAndApplyCow(cow);
    }
    rsp.status(success ? StatusCodes.OK : StatusCodes.BAD_REQUEST).send();
  });
  apiRouter.post("/update", jsonParser, async (req, rsp) => {
    const cow = Cow.makeRandom("os40");
    await setFortuneForCow(cow);
    const success: boolean = await generateAndApplyCow(cow);
    rsp.status(success ? StatusCodes.OK : StatusCodes.BAD_REQUEST).send();
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
