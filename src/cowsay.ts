import {
  Canvas,
  CanvasRenderingContext2D,
  createCanvas,
  registerFont,
} from "canvas";
import { CANVAS_TEXT } from "./constants";
import gm, { State } from "gm";
import { error } from "console";
import { writeFile } from "fs";

type cows = "cow";

type lineProps = {
  line: string;
  width: number;
};

const wrapLines = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): lineProps[] => {
  var words: string[] = text.replace(/\s+/g, " ").split(" ");
  var lines: lineProps[] = [];
  var currentLine: string = words[0];
  var currentWidth: number = ctx.measureText(currentLine).width;

  for (var i = 1; i < words.length; i++) {
    var word: string = words[i];
    var wordWidth: number = ctx.measureText(" " + word).width;
    if (currentWidth + wordWidth < maxWidth) {
      currentLine += " " + word;
      currentWidth += wordWidth;
    } else {
      lines.push({ line: currentLine, width: currentWidth });
      currentLine = word;
      currentWidth = ctx.measureText(currentLine).width;
    }
  }
  lines.push({ line: currentLine, width: currentWidth });
  return lines;
};

export const cowSay = (
  text: string,
  outFile: string,
  cow: cows = "cow",
): boolean => {
  /* Try to print the given text onto the desired cow template */

  const templateDir: string = "./templates";
  const cowFile: string = `${templateDir}/${cow}.bmp`;
  const font: string = `${templateDir}/minecraft.ttf`;

  // Calculate text wrapping and dimensions
  registerFont(font, { family: "Minecraft" });
  const canvas: Canvas = createCanvas(1, 1);
  const ctx: CanvasRenderingContext2D = canvas.getContext("2d");
  ctx.font = "11pt 'Minecraft'";
  const lines: lineProps[] = wrapLines(ctx, text, CANVAS_TEXT.width);

  console.log(text);
  console.log(lines);

  if (lines.length * CANVAS_TEXT.line_height > CANVAS_TEXT.height) {
    return false;
  }

  // If the text fits, save it as new file
  // (using gm as workaround since node-canvas cannot directly save bitmaps)
  const bitmap: State = gm(cowFile);
  bitmap.antialias(false);

  var size = 6.0;
  var vpos = 6;
  while (size < 14) {
    bitmap.font(font, size);
    bitmap.drawText(6, vpos, `Lorem ipsum dolor sit amet`);
    size += 0.5;
    vpos += 6;
  }
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
