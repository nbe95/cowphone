import { writeFile } from "fs";
import gm, { State } from "gm";
import strftime from "strftime";
import { COW_DB, FTP_SERVER, PHONE_TYPES } from "../constants";
import { FontProps, TextBox } from "./text-box";

export type CowDefinition = {
  [phoneType: string]: {
    font: FontProps;
    cows: CowProps[];
  };
};

export type CowProps = {
  name: string;
  canvas: string;
  textBox: {
    offset: number[];
    width: number;
    height: number;
  };
};

export abstract class Cow {
  protected static _templateDir: string = "./static/logo/templates/";

  protected _textBox: TextBox;
  protected _cowProps: CowProps;

  public static makeRandom = (): Cow => {
    // const index: number = Math.floor(Math.random() * COW_TYPES.length);
    // return new Cow(COW_TYPES[index] as CowTypes);
    return new Os60Cow("Cat");
  };

  protected constructor(phoneType: PHONE_TYPES, cowName: string) {
    const cow = COW_DB[phoneType].cows.find((cow) => cow.name == cowName);
    if (cow === undefined) {
      throw new Error(`Cannot find cow with name "${cowName}!`);
    }
    this._cowProps = cow;

    this._textBox = new TextBox({
      width: cow.textBox.width,
      height: cow.textBox.height,
      font: COW_DB[phoneType].font,
    });

    console.log(`A ${this._cowProps.name} was born.`);
  }

  public speak(text: string, wrap: boolean = true): boolean {
    const oneLiner: string = text.trim().replace(/\s+/g, " ");

    // Check if the text will fit into the cow's speech bubble
    this._textBox.setText(text, wrap);
    if (this._textBox.isTextFitting()) {
      console.log("I will MOO!", {
        text: oneLiner,
        lines: this._textBox.getLines().length,
        boxSize: this._textBox.getTextSize(),
      });
      return true;
    }
    console.error("Holy cow! That won't fit into my speech bubble...", {
      text: oneLiner,
      lines: this._textBox.getLines().length,
      boxSize: this._textBox.getTextSize(),
    });
    return false;
  }

  // Abstract function which generates an image of the actual cow and returns the file name
  public abstract generate(): Promise<string>;

  protected _makeFileName = (extension: string) => `${strftime("%Y-%m-%d_%H-%M-%S")}.${extension}`;
}

export class Os40Cow extends Cow {
  constructor(cowName: string) {
    super("os40", cowName);
  }

  public generate = async (): Promise<string> => {
    const image: State = gm(`${Cow._templateDir}/${this._cowProps.canvas}`)
      .antialias(false)
      .font(this._textBox.getFontFile())
      .fontSize(this._textBox.getFontSize());

    // Iterate over each line and draw it
    const positionedText = this._textBox.getPositionedText(
      this._cowProps.textBox.offset[0],
      this._cowProps.textBox.offset[1],
      true,
      true,
      true,
    );
    positionedText.forEach((line) => image.drawText(line.x, line.y, line.line));

    // Save as bitmap file
    const writeProcess = async () =>
      new Promise<string>((resolve, reject) => {
        image.toBuffer((error: Error | null, buffer: Buffer) => {
          if (error) {
            reject(error);
          } else {
            // gm sets the biCompression field at offset 0x1E to BI_BITFIELDS (3),
            // while the OpenStage40 can only handle BI_RGB (0).
            if (buffer[0x1e] == 3) buffer[0x1e] = 0;

            const bmp: string = this._makeFileName("bmp");
            writeFile(FTP_SERVER.root + bmp, buffer, () => resolve(bmp));
          }
        });
      });
    return await writeProcess().then((fileName) => fileName);
  };
}

export class Os60Cow extends Cow {
  constructor(cowName: string) {
    super("os60", cowName);
  }

  public generate = async (): Promise<string> => {
    const image: State = gm(`${Cow._templateDir}/${this._cowProps.canvas}`)
      .antialias(false)
      .font(this._textBox.getFontFile())
      .fontSize(this._textBox.getFontSize());

    // Iterate over each line and draw it
    const positionedText = this._textBox.getPositionedText(
      this._cowProps.textBox.offset[0],
      this._cowProps.textBox.offset[1],
      true,
      true,
      true,
    );
    positionedText.forEach((line) => image.drawText(line.x, line.y, line.line));

    // Invert depending on phone theme
    image.negative();

    // Save as png file
    const writeProcess = async () =>
      new Promise<string>((resolve, reject) => {
        const png: string = this._makeFileName("png");
        image.write(FTP_SERVER.root + png, (error: any) => {
          if (error) {
            reject(error);
          } else {
            resolve(png);
          }
        });
      });
    return await writeProcess().then((fileName) => fileName);
  };
}
