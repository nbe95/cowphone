import { SpeechBubbleProps } from "./cow";
import { FtpServerProps } from "./server";

export const PROD = process.env.NODE_ENV === "production";
export const VERSION: string | undefined = process.env.COWPHONE_VERSION;
export const CRON_SCHEDULE: string = process.env.CRON_SCHEDULE ?? "0 0 0 * * *";

export const PHONE_HOST: string = process.env.PHONE_HOST ?? "";
export const ADMIN_PASSWORD: string = process.env.ADMIN_PASSWORD ?? "";

export const FTP_SERVER: FtpServerProps = {
  host: process.env.FTP_OWN_IP ?? "127.0.0.1",
  port: parseInt(process.env.FTP_OWN_PORT ?? "50021", 10),
  user: process.env.FTP_USER ?? "",
  password: process.env.FTP_PASSWORD ?? "",
  root: PROD ? "/home/coward" : "./.ftp",
};

export const SPEECH_BUBBLE: SpeechBubbleProps = {
  xOffset: 4,
  yOffset: 4,
  maxWidth: 105,
  maxLines: 4,
};
