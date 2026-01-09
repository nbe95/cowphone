import { existsSync } from "fs";
import { Cow } from "./cow.js";

describe("Cow powers", () => {
  beforeAll(() => {
    // if (!existsSync(FTP_SERVER.root)) {
    //   mkdirSync(FTP_SERVER.root, { recursive: true });
    // }
  });

  it("should be instantiable", async () => {
    expect(async () => {
      await Cow.make("os40", "Cow");
      await Cow.make("os60", "Cow");
    }).not.toThrow();

    expect(async () => {
      await Cow.makeRandom("os40");
      await Cow.makeRandom("os60");
    }).not.toThrow();
  });

  it("should not instantiate nonsense", async () => {
    expect(async () => {
      await Cow.make("os40", "not-existing");
    }).rejects.toThrow();

    expect(async () => {
      await Cow.make("os60", "not-existing");
    }).rejects.toThrow();
  });

  it("should generate bitmaps", async () => {
    const cow = await Cow.make("os40", "Cow");
    cow.tryToSpeak("Unit test");

    const fileName = await cow.generate();
    expect(fileName.substring(fileName.length - 4)).toBe(".bmp");
    expect(existsSync(fileName)).toBe(true);
  });

  it("should generate pngs", async () => {
    const cow = await Cow.make("os60", "Cow");
    cow.tryToSpeak("Unit test");

    const fileName = await cow.generate();
    expect(fileName.substring(fileName.length - 4)).toBe(".png");
    expect(existsSync(fileName)).toBe(true);
  });
});
