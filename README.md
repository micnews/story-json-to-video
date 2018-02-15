# story-json-to-video

Compile `story-json` documents into videos. This allows stories to be displayed on platforms that do not support "tap-through" user interaction.

Not all features of `story-json` format are supported at the moment, open an issue if you need something that isn't supported yet. PRs are always welcome too.

## Installation

This package requires [node.js](https://nodejs.org), version 8 or later.

This package uses `ffmpeg` to process videos, which need to be installed and in `PATH` directory.

This package depends on [node-canvas](https://github.com/Automattic/node-canvas), which requires Cairo, Pango, libpng, libjpeg, giflib and librsvg to be installed on the system. librsvg is optional for svg rendering. See https://github.com/Automattic/node-canvas#installation.

Example for macOS:

```
brew install ffmpeg
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

Use `--font` option to provide custom fonts, e.g. `--font MyFont=./my-font.otf`.

This uses [registerFont](https://github.com/Automattic/node-canvas#registerfont-for-bundled-fonts) from `node-canvas`.

## License

MIT
