import { Canvas, CanvasRenderingContext2D, createCanvas, registerFont } from "canvas";
import { resolve } from "path";

type TextLine = {
  line: string;
  width: number;
};

interface PositionedTextLine extends TextLine {
  x: number;
  y: number;
}

export type FontProps = {
  name: string;
  family: string;
  fileName: string;
  size: number;
  lineHeight: number;
};

type TextBoxProps = {
  width: number;
  height: number;
  font: FontProps;
};

// Class for a rectangular text box with certain properties to determine if text will fit inside
export class TextBox {
  private _fontDir: string = "./static/logo/fonts/";
  private _props: TextBoxProps;
  private _lines: TextLine[] = [];
  private _ctx: CanvasRenderingContext2D;

  constructor(props: TextBoxProps) {
    this._props = props;

    // Create canvas for internal use
    this._ctx = this._createCanvas();
  }

  private _createCanvas = (): CanvasRenderingContext2D => {
    registerFont(resolve(this._fontDir + this._props.font.fileName), {
      family: this._props.font.family,
    });
    const canvas: Canvas = createCanvas(this._props.width, this._props.height);
    const ctx: CanvasRenderingContext2D = canvas.getContext("2d");
    ctx.font = `${this._props.font.size}px "${this._props.font.name}"`;
    return ctx;
  };

  private _wrapLines = (text: string, maxWidth: number): TextLine[] => {
    // Create canvas to measure text dimensions
    const words: string[] = text.split(" ");
    const spaceWidth: number = this._ctx.measureText(" ").width;

    var lines: TextLine[] = [];
    var currentLine: string = words[0];
    var currentWidth: number = this._ctx.measureText(currentLine).width;

    for (var i = 1; i < words.length; i++) {
      var word: string = words[i];
      var wordWidth: number = this._ctx.measureText(word).width;
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

  public getFontFile = (): string => this._fontDir + this._props.font.fileName;
  public getFontSize = (): number => this._props.font.size;

  public setText = (text: string, wrap: boolean = true): void => {
    if (wrap) {
      // Rearrange multiple spaces (also new lines) and wrap text
      this._lines = this._wrapLines(text.trim().replace(/\s+/g, " "), this._props.width);
    } else {
      // Take lines as they come and start measuring
      this._lines = text
        .split(/\r?\n/)
        .map((l) => ({ line: l, width: this._ctx.measureText(l).width }));
    }
  };

  public getLines = (): string[] => this._lines.map((line) => line.line);

  public getTextSize = (): { x: number; y: number } => ({
    x: Math.max(...this._lines.map((l) => l.width)),
    y: this.getLines().length * this._props.font.lineHeight,
  });

  public isTextFitting = (): boolean => {
    const textSize = this.getTextSize();
    return textSize.x <= this._props.width && textSize.y <= this._props.height;
  };

  public getPositionedText = (
    xOffset: number,
    yOffset: number,
    xCenter: boolean = true,
    yCenter: boolean = true,
    inclLeadingSpace: boolean = false,
  ): PositionedTextLine[] => {
    const linesOffsetY: number = yCenter ? (this._props.height - this.getTextSize().y) / 2 : 0;
    return this._lines.map((line, index) => {
      // Note: Leading space must be calculated separately, because some libs trim the string when drawing
      const leadingSpace: string = line.line.match(/^\s+/)?.[0] ?? "";
      const hSpaceOffset: number =
        inclLeadingSpace && leadingSpace.length ? this._ctx.measureText(leadingSpace).width : 0;
      const xPos: number =
        xOffset + (xCenter ? Math.floor((this._props.width - line.width) / 2) : 0) + hSpaceOffset;
      const yPos: number = yOffset + (index + 1) * this._props.font.lineHeight + linesOffsetY;

      return { ...line, x: xPos, y: yPos };
    });
  };
}
