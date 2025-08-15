import findRemoveSync from "find-remove";
import { schedule } from "node-cron";
import { runApi } from "./api/api";
import {
  ADMIN_PASSWORD,
  CRON_SCHEDULE,
  FTP_SERVER,
  PHONE_HOST,
  PROD,
  VERSION,
} from "./config/environment";
import { Cow } from "./cow/cow";
import { getFortuneForCow } from "./cow/fortune";
import { runServer } from "./phone/ftp-server";
import { OpenStagePhone } from "./phone/openstage";

const setUpScheduler = () => {
  if (CRON_SCHEDULE) {
    schedule(CRON_SCHEDULE, async () => {
      console.log("Moo! Scheduler triggered. Generating a random cow with the need to speak.");

      const cow = Cow.makeRandom("os40");
      await getFortuneForCow(cow);
      if (!(await generateAndApplyCow(cow))) {
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

  // Generate cow image
  const fileName: string | void = await cow
    .generate()
    .then(async (fileName: string) => {
      console.log("Successfully brought the cow in the shed.", { fileName: fileName });
      return fileName;
    })
    .catch((reason: any) => {
      console.error("Failed to generate image!", reason);
    });

  if (!fileName) {
    return false;
  }

  // Finally, update the logo on our cowphone
  const phone = new OpenStagePhone(PHONE_HOST, ADMIN_PASSWORD);
  return await phone.updateLogo(FTP_SERVER, fileName).catch(() => {
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
