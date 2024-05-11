import { cowSay } from "./cowsay";
import { runServer } from "./server";

const main = async () => {
  try {
    console.log("Starting cowphone main task.");
    await Promise.all([runServer()]);
  } catch (error) {
    console.error("Error during cowphone main task:", error);
  }
};

main();

let text: string = process.env.TEXT ?? "";
cowSay(text, "/home/coward/foo.bmp");
