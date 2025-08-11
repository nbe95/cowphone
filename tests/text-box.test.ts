import { TextBox } from "../src/cow/text-box";

describe("Testing text box powers", () => {
  const fontFile: string = "tinyunicode/TinyUnicode.ttf"
  const size: number = 16
  const lineHeight: number = 7
  const makeBox = (width: number = 1000, height: number = 1000): TextBox =>
    new TextBox({ width: width, height: height, lineHeight: lineHeight, measureTextWidth: (text: string) => 0 })

  const lines: string =
    "Lorem ipsum dolor sit amet, consectetur adipisici elit,\nsed eiusmod tempor incidunt ut labore\net dolore magna\naliqua.";
  const loremBox: TextBox = makeBox();
  loremBox.setText(lines, false);

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

  test("Text should not be aligned", () => {
    const result = loremBox.getPositionedText(0, 0, false, false, false);
    expect(result[0]).toHaveProperty("x", 0);
    expect(result[1]).toHaveProperty("x", 0);
    expect(result[2]).toHaveProperty("x", 0);
    expect(result[3]).toHaveProperty("x", 0);

    expect(result[0]).toHaveProperty("y", lineHeight * 1 - 1);
    expect(result[1]).toHaveProperty("y", lineHeight * 2 - 1);
    expect(result[2]).toHaveProperty("y", lineHeight * 3 - 1);
    expect(result[3]).toHaveProperty("y", lineHeight * 4 - 1);
  });

  test("Text should be horizontally and vertically aligned", () => {
    const result = loremBox.getPositionedText(0, 0, true, true, false);
    expect(result[0]).toHaveProperty("x", 382);
    expect(result[1]).toHaveProperty("x", 415);
    expect(result[2]).toHaveProperty("x", 464);
    expect(result[3]).toHaveProperty("x", 487);

    expect(result[0]).toHaveProperty("y", 486 + lineHeight * 1 - 1);
    expect(result[1]).toHaveProperty("y", 486 + lineHeight * 2 - 1);
    expect(result[2]).toHaveProperty("y", 486 + lineHeight * 3 - 1);
    expect(result[3]).toHaveProperty("y", 486 + lineHeight * 4 - 1);
  });

  test("Text should be aligned with offsets", () => {
    const result = loremBox.getPositionedText(20, 50, true, false, false);
    expect(result[0]).toHaveProperty("x", 382 + 20);
    expect(result[1]).toHaveProperty("x", 415 + 20);
    expect(result[2]).toHaveProperty("x", 464 + 20);
    expect(result[3]).toHaveProperty("x", 487 + 20);

    expect(result[0]).toHaveProperty("y", lineHeight * 1 - 1 + 50);
    expect(result[1]).toHaveProperty("y", lineHeight * 2 - 1 + 50);
    expect(result[2]).toHaveProperty("y", lineHeight * 3 - 1 + 50);
    expect(result[3]).toHaveProperty("y", lineHeight * 4 - 1 + 50);
  });
});
