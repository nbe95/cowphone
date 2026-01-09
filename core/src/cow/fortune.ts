import { spawn } from "child_process";
import { Cow } from "./cow.js";

export const getFortune = async (): Promise<string> =>
  new Promise((resolve, reject) => {
    const cmd: string = "fortune";
    const args: string[] = ["-s"];

    const process = spawn(cmd, args);
    process.on("error", (code) => reject(code));
    process.on("exit", () => {
      const text: string = (process.stdout?.read() as Buffer).toString().trim();

      // Only include printable characters and \n
      resolve(text.replace(/[^ -~\n]+/g, ""));
    });
  });

export const getFortuneForCow = async (cow: Cow, maxTries: number = 30) => {
  let tries: number = 0;
  let text: string;
  do {
    text = await getFortune();
  } while (++tries <= maxTries && !cow.tryToSpeak(text));

  if (tries <= maxTries) {
    console.log(`Obtained fortune cookie after ${tries} tries.`);
  } else {
    cow.tryToSpeak("This phone has super cow powers...");
    console.log(
      `Could not obtain fortune cookie even with ${maxTries} tries. Using fallback cookie...`,
    );
  }
};
