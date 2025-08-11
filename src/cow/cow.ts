import strftime from "strftime";
import { FTP_SERVER } from "../config";
import { TextBox } from "./text-box";
import { Jimp, JimpInstance, loadFont, measureText } from "jimp";

import CowDb from "../../static/logo/cows.json";
export type CowType = keyof typeof CowDb;

type CowProps = {
  name: string,
  template: string,
  textBox: {
    width: number
    height: number,
    offset: number[]
  }
  image: {
    type: string,
    width: number,
    height: number
  },
  font:  {
    name: string;
    family: string;
    fileName: string;
    size: number,
    lineHeight: number,
  },
}

export class Cow {
  private static _fontDir: string = "./static/logo/fonts/";
  private static _templateDir: string = "./static/logo/templates/";

  public readonly type: CowType;
  public readonly props: CowProps;

  private _image: JimpInstance | undefined;
  private _font: any | undefined;
  private _textBox: TextBox | undefined;
  private _init: boolean = false;

  public static makeRandom = (type: CowType): Cow => {
    const cows = CowDb[type].cows;
    const sample: number = Math.floor(Math.random() * cows.length);
    return new Cow(type, cows[sample].name);
  };

  public constructor(type: CowType, name: string) {
    this.type = type;
    const cow = CowDb[type].cows.find((cow) => cow.name == name);
    if (cow === undefined) {
      throw new Error(`Cannot find cow with name "${name}!`);
    }
    this.props = {
      name: cow.name,
      template: cow.template,
      textBox: cow.textBox,
      image: CowDb[type].image,
      font: CowDb[type].font
    }
  }

  public init = async () => {
    this._image = new Jimp({ width: this.props.image.width, height: this.props.image.height });
    this._font = await loadFont(Cow._fontDir + this.props.font.fileName);
    this._textBox = new TextBox({
      width: this.props.textBox.width,
      height: this.props.textBox.height,
      lineHeight: this.props.font.lineHeight,
      measureTextWidth: (text: string) => measureText(this._font, text)
    });

    console.log(`A <${this.props.name}> was born!`);
    this._init = true;
  }

  public tryToSpeak(text: string): boolean {
    if (!this._init) {
      return false;
    }
    const oneLiner: string = text.trim().replace(/\s+/g, " ");

    // Check if the text will fit into the cow's speech bubble
    this._textBox!.setText(text);
    if (this._textBox!.isTextFitting()) {
      console.log("I will MOO!", {
        text: oneLiner,
        lines: this._textBox!.getLines().length,
        boxSize: this._textBox!.getTextSize(),
      });
      return true;
    }
    console.error("Holy cow! That won't fit into my speech bubble...", {
      text: oneLiner,
      lines: this._textBox!.getLines().length,
      boxSize: this._textBox!.getTextSize(),
    });
    return false;
  }

  public generate = async (): Promise<string> => {
    if (!this._init) {
      return "";
    }

    // Load image template
    this._image = (await Jimp.read(`${Cow._templateDir}/${this.props.template}`) as JimpInstance);
    if (this._image.width != this.props.image.width || this._image.height != this.props.image.height) {
      throw new Error("Size does not match!");
    }
    const imageExt: string = this.props.template.slice(this.props.template.lastIndexOf("."));

    // Iterate over each line and draw it
    const positionedText = this._textBox!.getPositionedText(
      this.props.textBox.offset[0],
      this.props.textBox.offset[1],
      true,
      true,
      true,
    );
    positionedText.forEach((line) => this._image!.print({ font: this._font, text: line.text, x: line.x, y: line.y }));

    // Invert depending on phone theme
    // this._image.invert();

    // Save image
    const baseName: string = `${FTP_SERVER.root}/${strftime("%Y-%m-%d_%H-%M-%S")}`;
    await this._image.write(`${baseName}.${imageExt}`);
    return `${baseName}.${imageExt}`
  };
}
