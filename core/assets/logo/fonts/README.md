# Fonts

This is the home of our fancy cow fonts.

## How to generate fnt files?

The `jimp` module requires fonts to be in fnt format; ttf etc. ist not supported!

To convert a given font file, follow these steps:

1. Java is required. Install JDK or JVM depending on your setup.
1. Download [Hiero](https://libgdx.com/wiki/tools/hiero) jar.
1. Run it: `java -jar ./runnable-hiero.jar`
1. Find a nice font of your choice and load it.
1. On the left, keep "Java" as rendering option.
1. On the right, choose black as color.
1. Click `File -> Save BMFont file (text)`; a fnt file and a png will be generated.
1. Profit.
