import findRemoveSync from "find-remove";
import { schedule } from "node-cron";
import withLocalTmpDir from "with-local-tmp-dir";
import { runApi } from "./api/api.js";
import {
  ADMIN_PASSWORD,
  CRON_SCHEDULE,
  FTP_SERVER,
  PHONE_HOST,
  PROD,
  VERSION,
} from "./config/environment.js";
import { Cow } from "./cow/cow.js";
import { getFortuneForCow } from "./cow/fortune.js";
import { runServer } from "./phone/ftp-server.js";
import { OpenStagePhone } from "./phone/openstage.js";

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
  const result = findRemoveSync(".", {
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
  var resetCwd: () => Promise<void> = () => Promise.resolve();
  try {
    console.log("Moo! Starting cowphone main task:", {
      version: VERSION,
      productive: PROD,
      phoneHost: PHONE_HOST,
      adminPassword: ADMIN_PASSWORD.replace(/./g, "*"),
    });

    if (!PROD) {
      resetCwd = await withLocalTmpDir({ prefix: ".barn" });
      console.info("Created temporary barn for development:", process.cwd());
    }

    const barnDir: string = process.cwd();
    setUpScheduler();
    runApi(barnDir);
    runServer(FTP_SERVER, barnDir);
  } catch (error) {
    console.error("Error during cowphone main task:", error);
    process.exit(1);
  }

  process.on("SIGTERM", async () => {
    console.log("\nShutting down, bye-bye!");
    await resetCwd();
  });
};

main();
