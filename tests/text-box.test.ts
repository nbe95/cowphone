import { TextBox } from "../src/cow/text-box";

describe("Testing text box powers", () => {
  const lh: number = 15;
  const makeBox = (width: number = 1000, height: number = 1000): TextBox =>
    new TextBox({
      width: width,
      height: height,
      font: {
        family: "Tiny Unicode",
        name: "TinyUnicode",
        fileName: "TinyUnicode.ttf",
        size: lh,
        lineHeight: lh,
      },
    });

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
      "labore et dolore magna aliqua. Ut enim ad minim",
      "veniam, quis nostrud exercitation ullamco laboris",
      "nisi ut aliquid ex ea commodi consequat.",
    ]);

    expect(getWrappedLorem(100)).toStrictEqual([
      "Lorem ipsum dolor sit",
      "amet, consectetur",
      "adipisici elit, sed",
      "eiusmod tempor incidunt",
      "ut labore et dolore",
      "magna aliqua. Ut enim",
      "ad minim veniam, quis",
      "nostrud exercitation",
      "ullamco laboris nisi ut",
      "aliquid ex ea commodi",
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

    expect(result[0]).toHaveProperty("y", lh * 1);
    expect(result[1]).toHaveProperty("y", lh * 2);
    expect(result[2]).toHaveProperty("y", lh * 3);
    expect(result[3]).toHaveProperty("y", lh * 4);
  });

  test("Text should be horizontally and vertically aligned", () => {
    const result = loremBox.getPositionedText(0, 0, true, true, false);
    expect(result[0]).toHaveProperty("x", 389);
    expect(result[1]).toHaveProperty("x", 420);
    expect(result[2]).toHaveProperty("x", 466);
    expect(result[3]).toHaveProperty("x", 487);

    expect(result[0]).toHaveProperty("y", 470 + lh * 1);
    expect(result[1]).toHaveProperty("y", 470 + lh * 2);
    expect(result[2]).toHaveProperty("y", 470 + lh * 3);
    expect(result[3]).toHaveProperty("y", 470 + lh * 4);
  });

  test("Text should be aligned with offsets", () => {
    const result = loremBox.getPositionedText(20, 50, true, false, false);
    expect(result[0]).toHaveProperty("x", 389 + 20);
    expect(result[1]).toHaveProperty("x", 420 + 20);
    expect(result[2]).toHaveProperty("x", 466 + 20);
    expect(result[3]).toHaveProperty("x", 487 + 20);

    expect(result[0]).toHaveProperty("y", lh * 1 + 50);
    expect(result[1]).toHaveProperty("y", lh * 2 + 50);
    expect(result[2]).toHaveProperty("y", lh * 3 + 50);
    expect(result[3]).toHaveProperty("y", lh * 4 + 50);
  });
});
