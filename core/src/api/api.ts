import bodyParser from "body-parser";
import express from "express";
import fs from "fs";
import { StatusCodes } from "http-status-codes";
import { generateAndApplyCow } from "../app.js";
import { CRON_SCHEDULE, PROD, VERSION } from "../config/environment.js";
import { Cow } from "../cow/cow.js";
import { getFortune, getFortuneForCow as setFortuneForCow } from "../cow/fortune.js";

export const runApi = (cowDir: string) => {
  const app = express();

  // API methods
  const jsonParser = bodyParser.json();
  const apiRouter = express.Router();

  apiRouter.get("/info", (req, rsp) => {
    rsp.json({ version: VERSION || null, cowTypes: [], updateSchedule: CRON_SCHEDULE });
  });

  apiRouter.get("/history", (req, rsp) => {
    fs.readdir(cowDir, (error, files) => {
      const cows = files?.filter((file) => !file.startsWith(".")) ?? [];
      rsp.json(cows.sort().reverse());
    });
  });

  apiRouter.get("/fortune", async (req, rsp) => {
    getFortune().then((fortune) => rsp.json({ text: fortune }));
  });

  apiRouter.post("/moo", jsonParser, async (req, rsp) => {
    Cow.make("os60", "Cow").then((cow) => {
      // cow.textCentered = Boolean(req.body.centered);
      // cow.textTrimmed = Boolean(req.body.trimmed);
      if (!cow.tryToSpeak(req.body.text ?? "")) {
        rsp.status(StatusCodes.BAD_REQUEST).send();
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
    });
  });

  apiRouter.post("/update", jsonParser, async (req, rsp) => {
    Cow.makeRandom("os60").then((cow) => {
      setFortuneForCow(cow).then(() => {
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
  });

  app.use("/api/v1", apiRouter);

  // Static web interface and file server for cow images
  app.use(express.static(PROD ? "./static/" : "../../frontend/static/"));
  app.use("/cow", express.static(cowDir));

  // Use Docker internal port when productive
  const port: number = PROD ? 80 : 50080;
  app.listen(port, () => {
    console.log("API and web interface are listening.", { port: port });
  });
};
