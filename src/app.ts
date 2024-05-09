import { runServer } from "./server";

const main = async () => {
  try {
    console.log("Starting cowphone main task.")
    await Promise.all([
      runServer()
    ]);
    console.log("Exited cowphone main task. Goodbye!")

  } catch (error) {
    console.error("Error during cowphone main task:", error);
  }
}

main();
