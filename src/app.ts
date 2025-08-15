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

      Cow.makeRandom("os60").then((cow) => {
        getFortuneForCow(cow).then(() => {
          generateAndApplyCow(cow).catch((error: any) => {
            console.error("Could not generate any file for our little bovine.", error);
          });
        });
      });
    });
  } else {
    console.warn("No schedule defined! Cow powers are only available via web interface.");
  }
};

export const clearOldCows = (daysUntilSlaughterhouse: number = 100) => {
  const result = findRemoveSync(FTP_SERVER.root, {
    age: { seconds: 60 * 60 * 24 * daysUntilSlaughterhouse },
  });
  const gone: string[] = Object.keys(result as Record<string, boolean>);
  if (gone.length) {
    console.log(`Deleted ${gone.length} old cows.`, gone);
  }
};

export const generateAndApplyCow = async (cow: Cow): Promise<void> =>
  new Promise(async (resolve, reject) => {
    clearOldCows();

    // Generate cow image
    cow.generate().then(
      (fileName) => {
        console.log("Successfully brought the cow in the shed.", { fileName: fileName });

        // Update the logo on our cowphone
        const phone = new OpenStagePhone(PHONE_HOST, ADMIN_PASSWORD);
        phone.updateLogo(FTP_SERVER, fileName).then(
          () => {
            console.log("Phone logo was updated successfully.");
            resolve();
          },
          (error: any) => {
            console.error("Could not contact phone via network.", error);
            reject();
          },
        );
      },
      (reason) => {
        console.error("Failed to generate image!", reason);
        reject();
      },
    );
  });

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
