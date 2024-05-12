import { ADMIN_PASSWORD, PHONE_HOST, SPEECH_BUBBLE, FTP_SERVER } from "./constants";
import { Cow } from "./cow";
// import { Cow } from "./cow";
import { fortune } from "./fortune";
import { FtpServerProps, runServer } from "./server";
import { Os40WebInterface } from "./webif";
import { schedule } from "node-cron";

const setUpScheduler = (ftpProps: FtpServerProps, phone: Os40WebInterface) => {
  schedule("0 0 0 * * *", async () => {
    console.log("Moo! Scheduler triggered.");

    // Create a cow and get it a fortune cookie
    const cow: Cow = new Cow(SPEECH_BUBBLE);
    const maxTries: number = 20;
    let tries: number = 0;
    let text: string;
    do {
      text = await fortune();
    } while (++tries <= maxTries && !cow.setText(text));

    if (tries <= maxTries) {
      console.log(`Obtained fortune cookie after ${tries} tries.`);
    } else {
      console.log(`Could not obtain fortune cookie even with ${maxTries} tries. Using fallback...`);
      cow.setText("This phone has super cow powers.");
    }

    // Save bitmap
    const imgName: string = `${new Date().toISOString().split("T")[0]}.bmp`;
    cow.saveBitmap(`${ftpProps.root}/${imgName}`);

    // Update logo on our cowphone
    await phone.authenticate();
    await phone.updateLogo(ftpProps, imgName);
  });
};

const main = async () => {
  try {
    const phone = new Os40WebInterface(PHONE_HOST, ADMIN_PASSWORD);
    console.log("Starting cowphone main task.");
    await Promise.all([runServer(FTP_SERVER), setUpScheduler(FTP_SERVER, phone)]);
  } catch (error) {
    console.error("Error during cowphone main task:", error);
  }
};

main();
