import { existsSync, mkdirSync } from "fs";
import { FTP_SERVER } from "../config/environment";
import { Cow } from "./cow";

describe("Test cow powers!", () => {
  beforeAll(() => {
    if (!existsSync(FTP_SERVER.root)) {
      mkdirSync(FTP_SERVER.root, { recursive: true });
    }
  });

  test("should not instantiate nonsense", () => {
    expect(() => {
      new Cow("os40", "not-existing");
    }).toThrow();

    expect(() => {
      new Cow("os60", "not-existing");
    }).toThrow();
  });

  test("should not moo when uninitialized", async () => {
    expect(() => {
      new Cow("os40", "Cow").tryToSpeak("foo");
    }).toThrow();

    expect(async () => {
      const cow = new Cow("os40", "Cow");
      await cow.init();
      cow.tryToSpeak("foo");
    }).not.toThrow();
  });

  test("should generate bitmaps", async () => {
    const cow: Cow = new Cow("os40", "Cow");
    await cow.init();
    cow.tryToSpeak("foo bar");

    const fileName = await cow.generate();
    expect(fileName.substring(fileName.length - 4)).toBe(".bmp");
    expect(existsSync(FTP_SERVER.root + fileName)).toBe(true);
  });

  test("should generate pngs", async () => {
    const cow: Cow = new Cow("os60", "Cow");
    await cow.init();
    cow.tryToSpeak("foo bar");

    const fileName = await cow.generate();
    expect(fileName.substring(fileName.length - 4)).toBe(".png");
    expect(existsSync(FTP_SERVER.root + fileName)).toBe(true);
  });
});
