#!/usr/bin/env node

const argv = require('minimist')(process.argv.slice(2), {
  string: ['font'],
});
const fs = require('fs');
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
  console.log('  --font <family>=<source-file>     Use custom font from the file');
  console.log('  --print-ffmpeg                    Print ffmpeg output');
  process.exit(1);
}

if (argv.help) {
  usage();
}

const input = argv._[0];
if (!input) {
  usage();
}

let json;
try {
  json = JSON.parse(fs.readFileSync(input, 'utf8'));
} catch (e) {
  console.error(`Unable to load json ${input}`);
  process.exit(1);
}

articleJsonToVideo(json, {
  fonts,
  printFfmpeg: argv['print-ffmpeg'],
}).catch(err => console.error('Unexpected error', err));
