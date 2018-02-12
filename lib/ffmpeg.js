const { spawn } = require('child_process');
const splitPngStream = require('./split-png-stream');

function ffmpeg(args) {
  const argList = args.replace(/\n/g, '').split(' ').filter(Boolean);
  console.log(argList.join(' '));

  const child = spawn('ffmpeg', argList);
  child.stderr.on('data', data => console.log(data.toString()));
  return child;
}

module.exports = args => new Promise((resolve, reject) => {
  const child = ffmpeg(args);
  child.on('close', resolve);
  child.on('error', reject);
});

module.exports.streamPng = (args, onPng) => new Promise((resolve, reject) => {
  const child = ffmpeg(args);
  child.on('error', reject);
  splitPngStream(child.stdout, onPng, resolve, reject);
});

module.exports.spawn = ffmpeg;
