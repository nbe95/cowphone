import { loadFont, measureText } from "jimp";
import { Alignment, TextBox } from "../src/cow/text-box";

describe("Testing text box powers", () => {
  let font: any;
  let makeBox: Function;
  let loremBox: TextBox;
  let lineHeight: number;

  beforeAll(async () => {
    // Load font and related classes asynchronously before tests
    font = await loadFont("./static/logo/fonts/tinyunicode/TinyUnicode-16.fnt");
    makeBox = (width: number = 1000, height: number = 1000): TextBox =>
      new TextBox({
        width: width,
        height: height,
        lineHeight: lineHeight,
        measureTextWidth: (text: string) => measureText(font, text),
      });
    lineHeight = 7;

    // Make a lorem ipsum box for convenience
    const lines: string =
      "Lorem ipsum dolor sit amet, consectetur adipisici elit,\nsed eiusmod tempor incidunt ut labore\net dolore magna\naliqua.";
    loremBox = makeBox();
    loremBox.setText(lines, false);
  });

  test("Loooong text should wrap properly", () => {
    const lorem: string =
      "Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat.";
    const getWrappedLorem = (width: number, height: number = 1000) => {
      const box: TextBox = makeBox(width, height);
      box.setText(lorem, true);
      return box.getLines();
    };

    expect(getWrappedLorem(1000)).toStrictEqual([lorem]);

    expect(getWrappedLorem(200)).toStrictEqual([
      "Lorem ipsum dolor sit amet, consectetur",
      "adipisici elit, sed eiusmod tempor incidunt ut",
      "labore et dolore magna aliqua. Ut enim ad",
      "minim veniam, quis nostrud exercitation",
      "ullamco laboris nisi ut aliquid ex ea commodi",
      "consequat.",
    ]);

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

  test("Text should be aligned by default", () => {
    const result = loremBox.getPositionedText(0, 0);
    expect(result).toHaveLength(4);

    expect(result[0]).toHaveProperty("x", 382);
    expect(result[1]).toHaveProperty("x", 415);
    expect(result[2]).toHaveProperty("x", 464);
    expect(result[3]).toHaveProperty("x", 487);

    expect(result[0]).toHaveProperty("y", loremBox.height / 2 + lineHeight * -2);
    expect(result[1]).toHaveProperty("y", loremBox.height / 2 + lineHeight * -1);
    expect(result[2]).toHaveProperty("y", loremBox.height / 2 + lineHeight * 0);
    expect(result[3]).toHaveProperty("y", loremBox.height / 2 + lineHeight * 1);
  });

  test("Text should be aligned top/left", () => {
    const result = loremBox.getPositionedText(0, 0, Alignment.hLeft | Alignment.vTop);
    expect(result).toHaveLength(4);

    expect(result[0]).toHaveProperty("x", 0);
    expect(result[1]).toHaveProperty("x", 0);
    expect(result[2]).toHaveProperty("x", 0);
    expect(result[3]).toHaveProperty("x", 0);

    expect(result[0]).toHaveProperty("y", lineHeight * 0);
    expect(result[1]).toHaveProperty("y", lineHeight * 1);
    expect(result[2]).toHaveProperty("y", lineHeight * 2);
    expect(result[3]).toHaveProperty("y", lineHeight * 3);
  });

  test("Text should be aligned middle/center", () => {
    const result = loremBox.getPositionedText(0, 0, Alignment.hCenter | Alignment.vMiddle);
    expect(result).toHaveLength(4);

    expect(result[0]).toHaveProperty("x", 382);
    expect(result[1]).toHaveProperty("x", 415);
    expect(result[2]).toHaveProperty("x", 464);
    expect(result[3]).toHaveProperty("x", 487);

    expect(result[0]).toHaveProperty("y", loremBox.height / 2 + lineHeight * -2);
    expect(result[1]).toHaveProperty("y", loremBox.height / 2 + lineHeight * -1);
    expect(result[2]).toHaveProperty("y", loremBox.height / 2 + lineHeight * 0);
    expect(result[3]).toHaveProperty("y", loremBox.height / 2 + lineHeight * 1);
  });

  test("Text should be aligned bottom/right", () => {
    const result = loremBox.getPositionedText(0, 0, Alignment.hRight | Alignment.vBottom);
    expect(result).toHaveLength(4);

    expect(result[0]).toHaveProperty("x", 765);
    expect(result[1]).toHaveProperty("x", 831);
    expect(result[2]).toHaveProperty("x", 929);
    expect(result[3]).toHaveProperty("x", 974);

    expect(result[0]).toHaveProperty("y", loremBox.height - lineHeight * 4);
    expect(result[1]).toHaveProperty("y", loremBox.height - lineHeight * 3);
    expect(result[2]).toHaveProperty("y", loremBox.height - lineHeight * 2);
    expect(result[3]).toHaveProperty("y", loremBox.height - lineHeight * 1);
  });

  test("Text should have offsets", () => {
    const result = loremBox.getPositionedText(20, 50, Alignment.hLeft | Alignment.vTop);
    expect(result).toHaveLength(4);

    expect(result[0]).toHaveProperty("x", 20);
    expect(result[1]).toHaveProperty("x", 20);
    expect(result[2]).toHaveProperty("x", 20);
    expect(result[3]).toHaveProperty("x", 20);

    expect(result[0]).toHaveProperty("y", 50 + lineHeight * 0);
    expect(result[1]).toHaveProperty("y", 50 + lineHeight * 1);
    expect(result[2]).toHaveProperty("y", 50 + lineHeight * 2);
    expect(result[3]).toHaveProperty("y", 50 + lineHeight * 3);
  });
});
