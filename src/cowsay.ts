import gm from "gm";

type cows = "cow";

export const cowSay = (text: string, outFile: string, cow: cows = "cow") => {
  const templateDir: string = "./templates";
  const cowFile: string = `${templateDir}/${cow}.bmp`;
  const font: string = `${templateDir}/font.ttf`;

  gm(cowFile)
    .font(font, 6)
    .drawText(15, 10, text)
    .write(outFile, (error) => {
      if (error) console.error(error);
      else console.log(`Successfully written ${outFile}`);
    });
};
