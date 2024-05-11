import { Canvas, CanvasRenderingContext2D, createCanvas, registerFont } from "canvas";
import gm, { State } from "gm";
import { writeFile } from "fs";

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

export type SpeechBubbleProps = {
  xOffset: number;
  yOffset: number;
  maxWidth: number;
  maxLines: number;
};

type Cows = "cow";

export class Cow {
  private static templateDir: string = "/cowphone/templates";
  public static font: FontProps = {
    family: "TinyUnicode",
    file: `${Cow.templateDir}/TinyUnicode.ttf`,
    size: 15,
    lineHeight: 7,
  };
  private getCowFile = (): string => `${Cow.templateDir}/${this.cow}.bmp`;

  private bubbleProps: SpeechBubbleProps;
  private cow: Cows;
  private lines: LineProps[] = [];

  constructor(speechBubbleProps: SpeechBubbleProps, cow: Cows = "cow") {
    this.bubbleProps = speechBubbleProps;
    this.cow = cow;
  }

  private static wrapLines = (text: string, maxWidth: number): LineProps[] => {
    // Create canvas to measure text dimensions
    const canvas: Canvas = createCanvas(1, 1);
    const ctx: CanvasRenderingContext2D = canvas.getContext("2d");
    ctx.font = `${Cow.font.size}px '${Cow.font.family}'`;

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
    const lines: LineProps[] = Cow.wrapLines(oneLiner, this.bubbleProps.maxWidth);

    // Check if the text will fit in the cow's speech bubble
    if (this.lines.length <= this.bubbleProps.maxLines) {
      this.lines = lines;
      return true;
    }
    return false;
  }

  public saveBitmap(outFile: string): void {
    // Using gm as workaround since node-canvas cannot directly save bitmaps
    const bitmap: State = gm(this.getCowFile()).antialias(false).font(Cow.font.file, Cow.font.size);

    // Draw line by line, centered both horizontally and vertically
    const lineOffset: number = Math.floor(
      ((this.bubbleProps.maxLines - this.lines.length) * Cow.font.lineHeight) / 2,
    );
    this.lines.forEach((line, index) => {
      const xPos: number = Math.floor((this.bubbleProps.maxWidth - line.width) / 2);
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
          console.log(`Successfully written ${outFile}`);
        });
      }
    });
  }
}

// Register canvas font once
registerFont(Cow.font.file, { family: Cow.font.family });
