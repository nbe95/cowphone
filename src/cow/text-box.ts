type TextLine = {
  text: string;
  width: number;
};

interface PositionedTextLine extends TextLine {
  x: number;
  y: number;
}

export type TextBoxProps = {
  width: number;
  height: number;
  lineHeight: number;
  measureTextWidth: (text: string) => number
};

// Class for a rectangular text box with certain properties to determine if text will fit inside
export class TextBox {
  public readonly width: number;
  public readonly height: number;
  public readonly lineHeight: number;

  private _measureTextWidth: (text: string) => number
  private _lines: TextLine[] = [];

  constructor(props: TextBoxProps) {
    this.width = props.width;
    this.height = props.height;
    this.lineHeight = props.lineHeight;
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
      this._lines = text
        .split(/\r?\n/)
        .map((l) => ({ text: l, width: this._measureTextWidth(l) }));
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
    xCenter: boolean = true,
    yCenter: boolean = true,
    inclLeadingSpace: boolean = false,
  ): PositionedTextLine[] => {
    const linesOffsetY: number = yCenter ? (this.height - this.getTextSize().y) / 2 : 0;
    return this._lines.map((line, index) => {
      // Note: Leading space must be calculated separately, because some libs trim the string when drawing
      const leadingSpace: string = line.text.match(/^\s+/)?.[0] ?? "";
      const hSpaceOffset: number =
        inclLeadingSpace && leadingSpace.length ? this._measureTextWidth(leadingSpace) : 0;

      const xPos: number = Math.round(
        (xCenter ? Math.floor((this.width - line.width) / 2) : 0) + hSpaceOffset,
      );
      const yPos: number = Math.floor((index + 1) * this.lineHeight + linesOffsetY - 1); // Prefer top alignment when off by 0.5px

      return { ...line, x: xOffset + xPos, y: yOffset + yPos };
    });
  };
}
