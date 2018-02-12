#!/usr/bin/env node

const fs = require('fs');
const articleJsonToVideo = require('../lib/main');

function usage() {
  console.log('USAGE: article-json-to-video <story.json>');
  process.exit(1);
}

const args = process.argv.slice(2);
if (!args[0]) {
  usage();
}

const json = JSON.parse(fs.readFileSync(args[0], 'utf8'));

articleJsonToVideo(json).catch(err => console.log(err));
