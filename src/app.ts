import { ADMIN_PASSWORD, PHONE_HOST, SPEECH_BUBBLE, FTP_SERVER } from "./constants";
// import { Cow } from "./cow";
import { fortune } from "./fortune";
import { runServer } from "./server";
import { Os40WebInterface } from "./webif";

// const getFortune = async () => {
// const cow = new Cow(SPEECH_BUBBLE);
// const maxTries: number = 20;
// let tries: number = 0;
// let text: string;
// do {
// text = await fortune();
// } while (++tries <= maxTries && !cow.setText(text));
//
// if (tries <= maxTries) {
// console.log(`Obtained fortune cookie after ${tries} tries.`);
// } else {
// console.log(`Could not obtain fortune cookie even with ${maxTries} tries. Using fallback...`);
// cow.setText("This phone has super cow powers.");
// }
//
// const date: string = new Date().toISOString().split("T")[0];
// cow.saveBitmap(`${FTP_ROOT}/${date}.bmp`);
// };
//
// const main = async () => {
// try {
// console.log("Starting cowphone main task.");
// await Promise.all([runServer(), getFortune()]);
// } catch (error) {
// console.error("Error during cowphone main task:", error);
// }
// };

async function foo() {
  const phone = new Os40WebInterface(PHONE_HOST, ADMIN_PASSWORD);
  await phone.authenticate();
  await phone.updateLogo({ ...FTP_SERVER, host: "192.168.1.40" }, "2024-05-11.bmp");
}

foo();

// main();
