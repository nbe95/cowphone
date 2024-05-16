import { Cow } from "../src/cow";

describe("Testing cow powers", () => {
  test("Word wrap with long text", () => {
    const lorem: string =
      "Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat.";
    const wrappedLorem = (width: number) => Cow.wrapLines(lorem, width).map((l) => l.line);

    expect(wrappedLorem(1000)).toStrictEqual([lorem]);
    expect(wrappedLorem(200)).toStrictEqual([
      "Lorem ipsum dolor sit amet, consectetur",
      "adipisici elit, sed eiusmod tempor incidunt ut",
      "labore et dolore magna aliqua. Ut enim ad minim",
      "veniam, quis nostrud exercitation ullamco laboris",
      "nisi ut aliquid ex ea commodi consequat.",
    ]);
    expect(wrappedLorem(100)).toStrictEqual([
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
    expect(wrappedLorem(30)).toStrictEqual([
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
