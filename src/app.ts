import findRemoveSync from "find-remove";
import { schedule } from "node-cron";
import { runApi } from "./api";
import {
  ADMIN_PASSWORD,
  CRON_SCHEDULE,
  FTP_SERVER,
  PHONE_HOST,
  PROD,
  SPEECH_BUBBLE,
  VERSION,
} from "./constants";
import { Cow } from "./cow";
import { fortune } from "./fortune";
import { runServer } from "./server";
import { Os40WebInterface } from "./webif";
import { mkdirp } from "mkdirp";

const setUpScheduler = () => {
  schedule(CRON_SCHEDULE, async () => {
    console.log("Moo! Scheduler triggered.");

    // First, clean-up any old files
    const result = findRemoveSync(FTP_SERVER.root, {
      age: {
        seconds: 60 * 60 * 24 * 100, // 100 days
      },
    });
    const gone: string[] = Object.keys(result as Record<string, boolean>);
    if (gone.length) console.log("Deleted old files.", gone);

    // Feed the cow with some fortune cookies
    makeCow(async (cow: Cow) => {
      const maxTries: number = 20;
      let tries: number = 0;
      let text: string;
      do {
        text = await fortune();
      } while (++tries <= maxTries && !cow.setText(text));

      if (tries <= maxTries) {
        console.log(`Obtained fortune cookie after ${tries} tries.`);
      } else {
        console.log(
          `Could not obtain fortune cookie even with ${maxTries} tries. Using fallback cookie...`,
        );
        cow.setText("This phone has super cow powers...");
      }
    });
  });
};

export const makeCow = async (textSetter: (cow: Cow) => Promise<void>): Promise<boolean> => {
  // Create a cow trying to speak
  const cow: Cow = new Cow(SPEECH_BUBBLE);
  await textSetter(cow);
  if (!cow.hasText()) {
    return false;
  }

  // Save bitmap
  const dateStr: string = new Date().toISOString().split(".")[0].replace(/\D+/g, "-");
  const imgName: string = `${dateStr}.bmp`;
  cow.saveBitmap(`${FTP_SERVER.root}/${imgName}`);

  // Update logo on our cowphone
  const phone = new Os40WebInterface(PHONE_HOST, ADMIN_PASSWORD);
  return await phone.authenticate().then(() => phone.updateLogo(FTP_SERVER, imgName));
};

const main = async () => {
  try {
    console.log("Moo! Starting cowphone main task:", {
      version: VERSION,
      productive: PROD,
    });
    console.log("Phone data:", {
      host: PHONE_HOST,
      adminPassword: ADMIN_PASSWORD.replace(/./g, "*"),
    });
    console.log("FTP data:", { targetServer: FTP_SERVER });
    if (!PROD) {
      mkdirp(FTP_SERVER.root).then((made) =>
        console.log("Created temporary FTP directory for development."),
      );
    }

    await Promise.all([runServer(FTP_SERVER), setUpScheduler(), runApi(FTP_SERVER.root)]);
  } catch (error) {
    console.error("Error during cowphone main task:", error);
  }
};

main();
