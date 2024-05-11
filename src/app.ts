import { SPEECH_BUBBLE } from "./constants";
import { Cow } from "./cow";
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

let foo = new Cow(SPEECH_BUBBLE);
if (foo.setText(process.env.TEXT ?? "")) foo.saveBitmap("/home/coward/foo.bmp");
