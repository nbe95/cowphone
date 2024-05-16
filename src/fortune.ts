import { spawn } from "child_process";

export const fortune = async (): Promise<string> =>
  new Promise((resolve, reject) => {
    const cmd: string = "fortune";
    const args: string[] = ["-s"];

    const process = spawn(cmd, args);
    process.on("error", (code) => reject(code));
    process.on("exit", () => resolve((process.stdout?.read() as Buffer).toString().trim()));
  });
