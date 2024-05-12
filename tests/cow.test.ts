import { Cow } from "../src/cow";

describe("Testing some cows", () => {
  test("Word wrap", () => {
    const lorem: string =
      "Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat.";
    const getWrapped = (width: number) => Cow.wrapLines(lorem, width).map((l) => l.line);

    expect(getWrapped(1000)).toStrictEqual([lorem]);
    expect(getWrapped(200)).toStrictEqual([
      "Lorem ipsum dolor sit amet, consectetur",
      "adipisici elit, sed eiusmod tempor incidunt ut",
      "labore et dolore magna aliqua. Ut enim ad minim",
      "veniam, quis nostrud exercitation ullamco laboris",
      "nisi ut aliquid ex ea commodi consequat.",
    ]);
    expect(getWrapped(100)).toStrictEqual([
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
    expect(getWrapped(30)).toStrictEqual([
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
