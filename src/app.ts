import findRemoveSync from "find-remove";
import { schedule } from "node-cron";
import strftime from "strftime";
import { runApi } from "./api";
import { ADMIN_PASSWORD, CRON_SCHEDULE, FTP_SERVER, PHONE_HOST, PROD, VERSION } from "./constants";
import { Cow } from "./cow";
import { getFortuneForCow } from "./fortune";
import { runServer } from "./server";
import { Os40WebInterface } from "./webif";

const setUpScheduler = () => {
  if (CRON_SCHEDULE) {
    schedule(CRON_SCHEDULE, async () => {
      console.log("Moo! Scheduler triggered. Generating a random cow with the need to speak.");

      const cow = Cow.makeRandom();
      getFortuneForCow(cow);
      if (!generateAndApplyCow(cow)) {
        console.error("Could not generate any file for our little bovine.");
      }
    });
  } else {
    console.warn("No schedule defined! Cow powers are only available via web interface.");
  }
};

export const generateAndApplyCow = async (cow: Cow): Promise<boolean> => {
  // First, clean-up any old files
  const result = findRemoveSync(FTP_SERVER.root, {
    age: {
      seconds: 60 * 60 * 24 * 100, // 100 days
    },
  });
  const gone: string[] = Object.keys(result as Record<string, boolean>);
  if (gone.length) console.log("Deleted old files.", gone);

  // What does the cow say?
  if (!cow.hasText()) {
    return false;
  }

  // Save bitmap
  const imgName: string = `${strftime("%Y-%m-%d_%H-%M-%S")}.bmp`;
  cow.saveBitmap(`${FTP_SERVER.root}/${imgName}`);

  // Update logo on our cowphone
  const phone = new Os40WebInterface(PHONE_HOST, ADMIN_PASSWORD);
  return await phone
    .authenticate()
    .then(() => phone.updateLogo(FTP_SERVER, imgName))
    .catch(() => {
      console.error("Could not contact phone via network.");
      return false;
    });
};

const main = async () => {
  try {
    console.log("Moo! Starting cowphone main task:", {
      version: VERSION,
      productive: PROD,
      phoneHost: PHONE_HOST,
      adminPassword: ADMIN_PASSWORD.replace(/./g, "*"),
    });

    await Promise.all([runServer(FTP_SERVER), setUpScheduler(), runApi(FTP_SERVER.root)]);
  } catch (error) {
    console.error("Error during cowphone main task:", error);
  }
};

main();
