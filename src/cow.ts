import { Canvas, CanvasRenderingContext2D, createCanvas, registerFont } from "canvas";
import { writeFile } from "fs";
import gm, { State } from "gm";
import { COW_DB, COW_TYPES, CowTypes } from "./constants";

type LineProps = {
  line: string;
  width: number;
};

type FontProps = {
  file: string;
  family: string;
  size: number;
  lineHeight: number;
};

export type CowDefinition = {
  canvas: string;
  text: {
    xOffset: number;
    yOffset: number;
    maxWidth: number;
    maxLines: number;
  };
};

export class Cow {
  private static _templateDir: string = "./static/cows";
  public static font: FontProps = {
    family: "TinyUnicode",
    file: `${Cow._templateDir}/TinyUnicode.ttf`,
    size: 15,
    lineHeight: 7,
  };

  private _cow: CowDefinition;
  private _lines: LineProps[] = [];
  public textCentered: boolean = true;
  public textTrimmed: boolean = true;

  public static makeRandom = (): Cow => {
    const index: number = Math.floor(Math.random() * COW_TYPES.length);
    return new Cow(COW_TYPES[index] as CowTypes);
  };

  constructor(cow: CowTypes = "cow") {
    const type: string = COW_TYPES.includes(cow) ? cow : "cow";
    this._cow = COW_DB[type];
    console.log(`A cow identifying as ${type} was born.`);
  }

  private static _makeCanvas = (): CanvasRenderingContext2D => {
    const canvas: Canvas = createCanvas(1, 1);
    const ctx = canvas.getContext("2d");
    ctx.font = `${Cow.font.size}px '${Cow.font.family}'`;
    return ctx;
  };

  public static wrapLines = (text: string, maxWidth: number): LineProps[] => {
    // Create canvas to measure text dimensions
    const ctx = Cow._makeCanvas();
    const words: string[] = text.split(" ");
    const spaceWidth: number = ctx.measureText(" ").width;

    var lines: LineProps[] = [];
    var currentLine: string = words[0];
    var currentWidth: number = ctx.measureText(currentLine).width;

    for (var i = 1; i < words.length; i++) {
      var word: string = words[i];
      var wordWidth: number = ctx.measureText(word).width;
      if (currentWidth + spaceWidth + wordWidth < maxWidth) {
        currentLine += " " + word;
        currentWidth += spaceWidth + wordWidth;
      } else {
        lines.push({ line: currentLine, width: currentWidth });
        currentLine = word;
        currentWidth = wordWidth;
      }
    }
    lines.push({ line: currentLine, width: currentWidth });
    return lines;
  };

  public setText(text: string): boolean {
    // Rearrange any spaces and wrap text to lines
    const oneLiner: string = text.trim().replace(/\s+/g, " ");
    if (oneLiner.length == 0) {
      return false;
    }

    let lines: LineProps[] = [];
    if (this.textTrimmed) {
      lines = Cow.wrapLines(oneLiner, this._cow.text.maxWidth);
    } else {
      // Take lines as they come and start measuring
      const ctx = Cow._makeCanvas();
      lines = text
        .replace(/\r+/g, "")
        .split("\n")
        .map((l) => ({ line: l, width: ctx.measureText(l).width }));
    }

    // Check if the text will fit in the cow's speech bubble
    if (
      lines.length <= this._cow.text.maxLines &&
      Math.max(...lines.map((l) => l.width)) <= this._cow.text.maxWidth
    ) {
      console.log(`I will moo "${oneLiner}" using ${lines.length} lines.`);
      this._lines = lines;
      return true;
    }
    console.error(
      `Holy cow! "${oneLiner}" (${lines.length} lines) won't fit into my speech bubble...`,
    );
    return false;
  }

  public hasText(): boolean {
    return this._lines.length > 0;
  }

  public saveBitmap(outFile: string): void {
    // Using gm as workaround since node-canvas cannot directly save bitmaps
    const bitmap: State = gm(`${Cow._templateDir}/${this._cow.canvas}`)
      .antialias(false)
      .font(Cow.font.file, Cow.font.size);

    // Draw line by line, centered both horizontally and vertically
    const ctx = Cow._makeCanvas();
    // Calculate vertical starting point for each line
    const lineOffset: number =
      Math.floor(((this._cow.text.maxLines - this._lines.length) * Cow.font.lineHeight) / 2) +
      this._cow.text.yOffset;

    // Iterate over each line and draw it
    this._lines.forEach((line, index) => {
      // Calculate x and y starting point
      // Note: Leading space must be calculated separately, because drawText() trims the string...
      const leadingSpace: string = line.line.match(/^\s+/)?.[0] ?? "";
      const spaceOffset: number = leadingSpace.length ? ctx.measureText(leadingSpace).width : 0;
      const xPos: number =
        (this.textCentered ? Math.floor((this._cow.text.maxWidth - line.width) / 2) : 0) +
        this._cow.text.xOffset +
        spaceOffset;
      const yPos: number = (index + 1) * Cow.font.lineHeight + lineOffset;

      bitmap.drawText(xPos, yPos, line.line);
    });

    // Save to file
    bitmap.toBuffer((error, buffer) => {
      if (error) {
        console.error(error);
      } else {
        // gm sets the biCompression field at offset 0x1E to BI_BITFIELDS (3),
        // while the OpenStage40 can only handle BI_RGB (0).
        if (buffer[0x1e] == 3) buffer[0x1e] = 0;

        writeFile(outFile, buffer, () => {
          console.log("Successfully brought the cow in the shed.", { file: outFile });
        });
      }
    });
  }
}

// Register canvas font once
registerFont(Cow.font.file, { family: Cow.font.family });
