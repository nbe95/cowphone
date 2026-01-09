type TextLine = {
  text: string;
  width: number;
};

interface PositionedTextLine extends TextLine {
  x: number;
  y: number;
}

export enum Alignment {
  hLeft = 0x01,
  hCenter = 0x02,
  hRight = 0x03,

  vTop = 0x10,
  vMiddle = 0x20,
  vBottom = 0x30,
}

export type TextBoxProps = {
  width: number;
  height: number;
  lineHeight: number;
  lineOffset: number;
  measureTextWidth: (text: string) => number;
};

// Class for a rectangular text box with certain properties to determine if text will fit inside
export class TextBox {
  public readonly width: number;
  public readonly height: number;
  public readonly lineHeight: number;
  public readonly lineOffset: number;

  private _measureTextWidth: (text: string) => number;
  private _lines: TextLine[] = [];

  constructor(props: TextBoxProps) {
    this.width = props.width;
    this.height = props.height;
    this.lineHeight = props.lineHeight;
    this.lineOffset = props.lineOffset;
    this._measureTextWidth = props.measureTextWidth;
  }

  private _wrapLines = (text: string, maxWidth: number): TextLine[] => {
    // Create canvas to measure text dimensions
    const words: string[] = text.split(" ");
    const spaceWidth: number = this._measureTextWidth(" ");

    var lines: TextLine[] = [];
    var currentLine: string = words[0];
    var currentWidth: number = this._measureTextWidth(currentLine);

    for (var i = 1; i < words.length; i++) {
      var word: string = words[i];
      var wordWidth: number = this._measureTextWidth(word);
      if (currentWidth + spaceWidth + wordWidth < maxWidth) {
        currentLine += " " + word;
        currentWidth += spaceWidth + wordWidth;
      } else {
        lines.push({ text: currentLine, width: currentWidth });
        currentLine = word;
        currentWidth = wordWidth;
      }
    }
    lines.push({ text: currentLine, width: currentWidth });
    return lines;
  };

  public setText = (text: string, wrap: boolean = true): void => {
    if (wrap) {
      // Rearrange multiple spaces (also new lines) and wrap text
      this._lines = this._wrapLines(text.trim().replace(/\s+/g, " "), this.width);
    } else {
      // Take lines as they come and start measuring
      this._lines = text.split(/\r?\n/).map((l) => ({ text: l, width: this._measureTextWidth(l) }));
    }
  };

  public getLines = (): string[] => this._lines.map((line) => line.text);

  public getTextSize = (): { x: number; y: number } => ({
    x: Math.max(...this._lines.map((l) => l.width)),
    y: this.getLines().length * this.lineHeight,
  });

  public isTextFitting = (): boolean => {
    const textSize = this.getTextSize();
    return textSize.x <= this.width && textSize.y <= this.height;
  };

  public getPositionedText = (
    xOffset: number,
    yOffset: number,
    align: Alignment = Alignment.hCenter | Alignment.vMiddle,
  ): PositionedTextLine[] => {
    // Calculate static y offsets for all lines (prefer top alignment when off by 0.5px)
    const linesOffsetY: number =
      this.lineOffset +
      Math.floor(
        (() => {
          switch (align & 0xf0) {
            case Alignment.vTop:
              return 0;
            case Alignment.vMiddle:
              return (this.height - this.getTextSize().y) / 2;
            case Alignment.vBottom:
              return this.height - this.getTextSize().y;
            default:
              return 0;
          }
        })(),
      );

    return this._lines.map((line, lineIndex) => {
      // Calculate x offset per line
      const linesOffsetX: number = Math.floor(
        (() => {
          switch (align & 0x0f) {
            case Alignment.hLeft:
              return 0;
            case Alignment.hCenter:
              return (this.width - line.width) / 2;
            case Alignment.hRight:
              return this.width - line.width;
            default:
              return 0;
          }
        })(),
      );

      return {
        ...line,
        x: xOffset + linesOffsetX,
        y: yOffset + linesOffsetY + lineIndex * this.lineHeight,
      };
    });
  };
}
