import {
  Canvas,
  CanvasRenderingContext2D,
  createCanvas,
  registerFont,
} from "canvas";
import { CANVAS_TEXT } from "./constants";
import gm, { State } from "gm";
import { writeFile } from "fs";

type cows = "cow";

type LineProps = {
  line: string;
  width: number;
};

export type TextProps = {
  offset_x: number;
  offset_y: number;
  max_width: number;
  max_lines: number;
  font_size: number;
  line_height: number;
};

const wrapLines = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): LineProps[] => {
  const words: string[] = text.trim().split(" ");
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

const textAsOneLiner = (text: string): string => text.replace(/\s+/g, " ");

export const cowSay = (
  text: string,
  outFile: string,
  cow: cows = "cow",
): boolean => {
  /* Try to print the given text onto the desired cow template */

  const templateDir: string = "./templates";
  const cowFile: string = `${templateDir}/${cow}.bmp`;
  const font: string = `${templateDir}/TinyUnicode.ttf`;

  // Calculate text wrapping and dimensions
  registerFont(font, { family: "TinyUnicode" });
  const canvas: Canvas = createCanvas(1, 1);
  const ctx: CanvasRenderingContext2D = canvas.getContext("2d");
  ctx.font = `${CANVAS_TEXT.font_size}px 'TinyUnicode'`;
  const lines: LineProps[] = wrapLines(
    ctx,
    textAsOneLiner(text),
    CANVAS_TEXT.max_width,
  );

  console.log(text);
  console.log(lines);

  if (lines.length > CANVAS_TEXT.max_lines) {
    return false;
  }

  // If the text fits, save it as new file
  // (using gm as workaround since node-canvas cannot directly save bitmaps)
  const bitmap: State = gm(cowFile)
    .antialias(false)
    .font(font, CANVAS_TEXT.font_size);

  const line_offset: number = Math.floor(
    ((CANVAS_TEXT.max_lines - lines.length) * CANVAS_TEXT.line_height) / 2,
  );
  let pos_x: number;
  let pos_y: number;
  lines.forEach((line, index) => {
    pos_x = Math.floor((CANVAS_TEXT.max_width - line.width) / 2);
    pos_y = (index + 1) * CANVAS_TEXT.line_height + line_offset;
    bitmap.drawText(pos_x, pos_y, line.line);
  });

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

  return true;
};
