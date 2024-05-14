import express from "express";
import fs from "fs";
import { VERSION } from "../constants";

export const runApi = async (cowDir: string) => {
  const app = express();
  const port: number = 50080;

  // API methods
  const apiRouter = express.Router();
  apiRouter.get("/version", (req, rsp) => {
    rsp.send({ version: VERSION ?? null });
  });
  apiRouter.get("/history", (req, rsp) => {
    fs.readdir(cowDir, (_, files) => {
      rsp.send(files);
    });
  });
  app.use("/api/v1", apiRouter);

  // Static webinterface and file server for cow images
  app.use(express.static("src/api/static"));
  app.use("/cow", express.static(cowDir));

  app.listen(port, () => {
    console.log(`Webinterfave/API listening on port ${port}`);
  });
};
