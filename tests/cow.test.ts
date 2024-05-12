import { Cow } from "../src/cow";

describe("Testing some cows", () => {
  test("Word wrap", () => {
    const lorem: string =
      "Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat.";

    expect(Cow.wrapLines(lorem, 1000).map((l) => l.line)).toStrictEqual([lorem]);
    expect(Cow.wrapLines(lorem, 200).map((l) => l.line)).toStrictEqual([
      "Lorem ipsum dolor sit amet, consectetur",
      "adipisici elit, sed eiusmod tempor incidunt ut",
      "labore et dolore magna aliqua. Ut enim ad minim",
      "veniam, quis nostrud exercitation ullamco laboris",
      "nisi ut aliquid ex ea commodi consequat.",
    ]);
    expect(Cow.wrapLines(lorem, 100).map((l) => l.line)).toStrictEqual([
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
    expect(Cow.wrapLines(lorem, 30).map((l) => l.line)).toStrictEqual([
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
