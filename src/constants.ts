import { SpeechBubbleProps } from "./cow";
import { FtpServerProps } from "./server";

export const PHONE_HOST: string = "192.168.1.10";
export const ADMIN_PASSWORD: string = "123456";

export const FTP_SERVER: FtpServerProps = {
  host: "127.0.0.1",
  port: 50021,
  user: "coward",
  password: "os40",
  root: "/home/coward",
};

export const SPEECH_BUBBLE: SpeechBubbleProps = {
  xOffset: 4,
  yOffset: 4,
  maxWidth: 105,
  maxLines: 4,
};
