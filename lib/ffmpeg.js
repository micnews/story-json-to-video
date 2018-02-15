const { spawn } = require('child_process');
const splitPngStream = require('./split-png-stream');

function ffmpeg(args, printOutput = false) {
  const argList = args.replace(/\n/g, '').split(' ').filter(Boolean);
  if (printOutput) {
    console.log(`ffmpeg ${argList.join(' ')}`);
  }

  const child = spawn('ffmpeg', argList);
  if (printOutput) {
    child.stderr.on('data', data => console.log(data.toString()));
  }
  return child;
}

module.exports = (args, printOutput = false) => new Promise((resolve, reject) => {
  const child = ffmpeg(args, printOutput);
  child.on('close', resolve);
  child.on('error', reject);
});

module.exports.streamPng = (args, onPng) => new Promise((resolve, reject) => {
  const child = ffmpeg(args);
  child.on('error', reject);
  splitPngStream(child.stdout, onPng, resolve, reject);
});

module.exports.spawn = ffmpeg;
