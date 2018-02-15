# story-json-to-video

Compile story-json documents into videos. This allows stories to be displayed on platforms that do not support "tap-to-advance" user interaction.

## Installation

This package requires [node.js](https://nodejs.org), version 8 or later.

This package depends on [node-canvas](https://github.com/Automattic/node-canvas), which requires Cairo, Pango and librsvg to be installed on the system. librsvg is optional for svg rendering. See https://github.com/Automattic/node-canvas#installation.

Example for macOS:

```
brew install pkg-config cairo pango libpng jpeg giflib librsvg
PKG_CONFIG_PATH=/usr/local/opt/zlib/lib/pkgconfig npm install story-json-to-video -g
```

This package depends on [yoga](https://github.com/facebook/yoga), targeting node.js platform:

```
npm config set yoga-layout:platform node -g
```

## Usage

To compile `story.json` input file into video run:

```
story-json-to-video story.json
```

If everything is good, program will create resulting `story.mp4` in the same directory.

To list additional options:

```
story-json-to-video --help
```




## Custom fonts

Use `--font` option to provide custom fonts, e.g. `--font MyFont=./my-font.otf`. This uses [registerFont](https://github.com/Automattic/node-canvas#registerfont-for-bundled-fonts) from `node-canvas`.

## License

MIT
