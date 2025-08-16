import dotenv from "dotenv";
import { FtpServerProps } from "../phone/ftp-server";

dotenv.config();

export const PROD = process.env.NODE_ENV === "production";
export const VERSION: string | undefined = process.env.COWPHONE_VERSION;
export const CRON_SCHEDULE: string | undefined = process.env.CRON_SCHEDULE;

export const PHONE_HOST: string = process.env.PHONE_HOST ?? "";
export const ADMIN_PASSWORD: string = process.env.ADMIN_PASSWORD ?? "";

export const FTP_SERVER: FtpServerProps = {
  host: process.env.FTP_OWN_IP ?? "127.0.0.1",
  port: parseInt(process.env.FTP_OWN_PORT ?? "50021", 10),
  user: process.env.FTP_USER ?? "",
  password: process.env.FTP_PASSWORD ?? "",
  root: PROD ? "./barn" : "./.barn/",
};

export const OS60_COLOR_MODE: string = process.env.OS60_COLOR_MODE ?? "black";
