#!/usr/bin/env node

const argv = require('minimist')(process.argv.slice(2), {
  string: ['font', 'pages'],
  boolean: ['print-ffmpeg', 'save-poster-images', 'poster-images',
    'no-concat', 'no-download-assets'],
});
const fs = require('fs');
const { multirange } = require('multi-integer-range');
const articleJsonToVideo = require('../lib/main');

const fontOpts = (Array.isArray(argv.font) ? argv.font : [argv.font]).filter(Boolean);
const fonts = fontOpts.map((fontStr) => {
  const [family, source] = fontStr.split('=');
  try {
    fs.statSync(source);
  } catch (e) {
    console.error(`Unable to load font ${source}`);
    process.exit(1);
  }

  return { family, source };
});

function usage() {
  console.log('USAGE: article-json-to-video [options] <story.json>');
  console.log('');
  console.log('OPTIONS:');
  console.log('  --font <family>=<file>   Use custom font from the file');
  console.log('  --help                   Show this message');
  console.log('  --no-concat              Do not concatenate per-page videos into resulting video');
  console.log('  --no-download-assets     Reuse existing pre-downloaded assets (<story>-image-asset-<name>, <story>-media-<page>.mp4) from the previous run');
  console.log('  --pages                  List of pages to include (e.g. "1-2,4,6-"), defaults to all');
  console.log('  --poster-images          Only save first frame of each page as image');
  console.log('  --print-ffmpeg           Print ffmpeg output');
  console.log('  --save-poster-images     Save first frame of each page as image');
  process.exit(1);
}

if (argv.help) {
  usage();
}

const input = argv._[0];
if (!input) {
  usage();
}

let pagesRange = null;
try {
  pagesRange = multirange(
    argv.pages || '0-',
    { parseUnbounded: true },
  );
} catch (e) {
  console.error('Invalid pages range');
  process.exit(1);
}

let json;
try {
  json = JSON.parse(fs.readFileSync(input, 'utf8'));
} catch (e) {
  console.error(`Unable to load json ${input}`);
  process.exit(1);
}

const outputName = input.replace(/\.json$/, '');

articleJsonToVideo(json, {
  fonts,
  printFfmpeg: argv['print-ffmpeg'],
  savePosterImages: argv['save-poster-images'],
  posterImages: argv['poster-images'],
  noConcat: argv.concat === false,
  noDownloadAssets: argv['download-assets'] === false,
  pagesRange,
  outputName,
}).catch(err => console.error('Unexpected error', err));
