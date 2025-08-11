import { existsSync, mkdirSync } from "fs";
import { FTP_SERVER } from "../src/config";
import { Cow } from "../src/cow/cow";

describe("Testing cow powers", () => {
  beforeAll(() => {
    if (!existsSync(FTP_SERVER.root)) {
      mkdirSync(FTP_SERVER.root, { recursive: true });
    }
  });

  test("Should not instantiate nonsense", () => {
    expect(() => {
      new Cow("os40", "not-existing");
    }).toThrow();

    expect(() => {
      new Cow("os60", "not-existing");
    }).toThrow();
  });

  // test("Should generate Bitmaps", async () => {
  //   const cow: Cow = new Os40Cow("Cow");
  //   cow.speak("foo bar");

  //   const fileName = await cow.generate();
  //   expect(fileName.substring(fileName.length - 4)).toBe(".bmp");
  //   expect(existsSync(FTP_SERVER.root + fileName)).toBe(true);
  // });

  // test("Should generate PNGs", async () => {
  //   const cow: Cow = new Os60Cow("Cow");
  //   cow.speak("foo bar");

  //   const fileName = await cow.generate();
  //   expect(fileName.substring(fileName.length - 4)).toBe(".png");
  //   expect(existsSync(FTP_SERVER.root + fileName)).toBe(true);
  // });
});
