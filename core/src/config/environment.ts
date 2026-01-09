import dotenv from "dotenv";
import random from "random-string-generator";
import { FtpServerProps } from "../phone/ftp-server.js";

dotenv.config();

export const PROD = process.env.NODE_ENV === "production";
export const VERSION: string | undefined = process.env.COWPHONE_VERSION;

export const CRON_SCHEDULE: string | undefined = process.env.CRON_SCHEDULE;

export const OS_PHONE_HOST: string = process.env.OS_PHONE_HOST ?? "";
export const OS_ADMIN_PASSWORD: string = process.env.OS_ADMIN_PASSWORD ?? "";

export const OWN_HOST: string = process.env.OWN_HOST ?? "127.0.0.1";
export const FTP_SERVER: FtpServerProps = {
  host: OWN_HOST,
  port: PROD ? 21 : 50021,
  user: "coward",
  password: random(40),
};
export const HTTP_PORT: number = PROD ? 80 : 50080;
