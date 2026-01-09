import { loadFont, measureText } from "jimp";
import { Alignment, TextBox } from "./text-box.js";

describe("Long text", () => {
  let font: any;
  let makeBox: Function;
  let lineHeight: number;
  let lineOffset: number;

  const lorem: string =
    "Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat.";
  const getWrappedLorem = (width: number, height: number = 1000) => {
    const box: TextBox = makeBox(width, height);
    box.setText(lorem, true);
    return box.getLines();
  };

  beforeAll(async () => {
    // Load font and related classes asynchronously before tests
    font = await loadFont("./assets/logo/fonts/tinyunicode/TinyUnicode-16.fnt");
    lineHeight = 7;
    lineOffset = -5;
    makeBox = (width: number = 1000, height: number = 1000): TextBox =>
      new TextBox({
        width: width,
        height: height,
        lineHeight: lineHeight,
        lineOffset: lineOffset,
        measureTextWidth: (text: string) => measureText(font, text),
      });
  });

  it("should not wrap at all", () => {
    expect(getWrappedLorem(1000)).toStrictEqual([lorem]);
  });

  it("should wrap in a medium box", () => {
    expect(getWrappedLorem(200)).toStrictEqual([
      "Lorem ipsum dolor sit amet, consectetur",
      "adipisici elit, sed eiusmod tempor incidunt ut",
      "labore et dolore magna aliqua. Ut enim ad",
      "minim veniam, quis nostrud exercitation",
      "ullamco laboris nisi ut aliquid ex ea commodi",
      "consequat.",
    ]);
  });

  it("should wrap in a small box", () => {
    expect(getWrappedLorem(100)).toStrictEqual([
      "Lorem ipsum dolor sit",
      "amet, consectetur",
      "adipisici elit, sed",
      "eiusmod tempor",
      "incidunt ut labore et",
      "dolore magna aliqua.",
      "Ut enim ad minim",
      "veniam, quis nostrud",
      "exercitation ullamco",
      "laboris nisi ut aliquid",
      "ex ea commodi",
      "consequat.",
    ]);
  });

  it("should wrap in a tiny box", () => {
    expect(getWrappedLorem(30)).toStrictEqual([
      "Lorem",
      "ipsum",
      "dolor",
      "sit",
      "amet,",
      "consectetur",
      "adipisici",
      "elit,",
      "sed",
      "eiusmod",
      "tempor",
      "incidunt",
      "ut",
      "labore",
      "et",
      "dolore",
      "magna",
      "aliqua.",
      "Ut",
      "enim",
      "ad",
      "minim",
      "veniam,",
      "quis",
      "nostrud",
      "exercitation",
      "ullamco",
      "laboris",
      "nisi ut",
      "aliquid",
      "ex ea",
      "commodi",
      "consequat.",
    ]);
  });
});

describe("Text box", () => {
  let font: any;
  let loremBox: TextBox;
  let lineHeight: number;
  let lineOffset: number;

  beforeAll(async () => {
    // Load font and related classes asynchronously before tests
    lineHeight = 7;
    lineOffset = -5;
    font = await loadFont("./assets/logo/fonts/tinyunicode/TinyUnicode-16.fnt");

    // Make a lorem ipsum box for convenience
    loremBox = ((text, width: number = 1000, height: number = 1000): TextBox => {
      const box = new TextBox({
        width: width,
        height: height,
        lineHeight: lineHeight,
        lineOffset: lineOffset,
        measureTextWidth: (text: string) => measureText(font, text),
      });
      box.setText(text, false);
      return box;
    })(
      "Lorem ipsum dolor sit amet, consectetur adipisici elit,\nsed eiusmod tempor incidunt ut labore\net dolore magna\naliqua.",
    );
  });

  it("should be aligned by default", () => {
    const result = loremBox.getPositionedText(0, 0);
    expect(result).toHaveLength(4);

    expect(result[0]).toHaveProperty("x", 382);
    expect(result[1]).toHaveProperty("x", 415);
    expect(result[2]).toHaveProperty("x", 464);
    expect(result[3]).toHaveProperty("x", 487);

    expect(result[0]).toHaveProperty("y", lineOffset + loremBox.height / 2 + lineHeight * -2);
    expect(result[1]).toHaveProperty("y", lineOffset + loremBox.height / 2 + lineHeight * -1);
    expect(result[2]).toHaveProperty("y", lineOffset + loremBox.height / 2 + lineHeight * 0);
    expect(result[3]).toHaveProperty("y", lineOffset + loremBox.height / 2 + lineHeight * 1);
  });

  it("should be aligned top/left", () => {
    const result = loremBox.getPositionedText(0, 0, Alignment.hLeft | Alignment.vTop);
    expect(result).toHaveLength(4);

    expect(result[0]).toHaveProperty("x", 0);
    expect(result[1]).toHaveProperty("x", 0);
    expect(result[2]).toHaveProperty("x", 0);
    expect(result[3]).toHaveProperty("x", 0);

    expect(result[0]).toHaveProperty("y", lineOffset + lineHeight * 0);
    expect(result[1]).toHaveProperty("y", lineOffset + lineHeight * 1);
    expect(result[2]).toHaveProperty("y", lineOffset + lineHeight * 2);
    expect(result[3]).toHaveProperty("y", lineOffset + lineHeight * 3);
  });

  it("should be aligned middle/center", () => {
    const result = loremBox.getPositionedText(0, 0, Alignment.hCenter | Alignment.vMiddle);
    expect(result).toHaveLength(4);

    expect(result[0]).toHaveProperty("x", 382);
    expect(result[1]).toHaveProperty("x", 415);
    expect(result[2]).toHaveProperty("x", 464);
    expect(result[3]).toHaveProperty("x", 487);

    expect(result[0]).toHaveProperty("y", lineOffset + loremBox.height / 2 + lineHeight * -2);
    expect(result[1]).toHaveProperty("y", lineOffset + loremBox.height / 2 + lineHeight * -1);
    expect(result[2]).toHaveProperty("y", lineOffset + loremBox.height / 2 + lineHeight * 0);
    expect(result[3]).toHaveProperty("y", lineOffset + loremBox.height / 2 + lineHeight * 1);
  });

  it("should be aligned bottom/right", () => {
    const result = loremBox.getPositionedText(0, 0, Alignment.hRight | Alignment.vBottom);
    expect(result).toHaveLength(4);

    expect(result[0]).toHaveProperty("x", 765);
    expect(result[1]).toHaveProperty("x", 831);
    expect(result[2]).toHaveProperty("x", 929);
    expect(result[3]).toHaveProperty("x", 974);

    expect(result[0]).toHaveProperty("y", lineOffset + loremBox.height - lineHeight * 4);
    expect(result[1]).toHaveProperty("y", lineOffset + loremBox.height - lineHeight * 3);
    expect(result[2]).toHaveProperty("y", lineOffset + loremBox.height - lineHeight * 2);
    expect(result[3]).toHaveProperty("y", lineOffset + loremBox.height - lineHeight * 1);
  });

  it("should have offsets", () => {
    const result = loremBox.getPositionedText(20, 50, Alignment.hLeft | Alignment.vTop);
    expect(result).toHaveLength(4);

    expect(result[0]).toHaveProperty("x", 20);
    expect(result[1]).toHaveProperty("x", 20);
    expect(result[2]).toHaveProperty("x", 20);
    expect(result[3]).toHaveProperty("x", 20);

    expect(result[0]).toHaveProperty("y", 50 + lineOffset + lineHeight * 0);
    expect(result[1]).toHaveProperty("y", 50 + lineOffset + lineHeight * 1);
    expect(result[2]).toHaveProperty("y", 50 + lineOffset + lineHeight * 2);
    expect(result[3]).toHaveProperty("y", 50 + lineOffset + lineHeight * 3);
  });
});
