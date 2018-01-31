const { spawn } = require('child_process');
const split = require('./split-png-stream');
const EventEmitter = require('events');

const w = 406;
const h = 720;
const fps = 25;

function srcStream(onFrame, onDone) {
  const emitter = new EventEmitter();
  const args = `-y -i test.mp4 -vf scale=${w}x${h} -r ${fps} ` +
    `-an -f image2pipe -vcodec png -`;
  const child = spawn('ffmpeg', args.split(' '));

  split(child.stdout, (file) => {
    emitter.emit('frame', file);
  }, () => {
    emitter.emit('end');
  });

  child.stderr.on('data', () => {});
  child.on('close', () => {});
  return emitter;
}

function destStream() {
  const fmt = `-vcodec libx264 -profile:v main -level 3.1 ` +
    `-r ${fps} -crf 23 -x264-params ref=4 -pix_fmt yuv420p`;
  const args = `-y -f image2pipe -vcodec png -r ${fps} -i - ${fmt} test-out.mp4`;
  const child = spawn('ffmpeg', args.split(' '));
  return child;
}

module.exports = (opts, transformFn) => {
  const src = srcStream();
  const dest = destStream();

  let frameIndex = 0;
  src.on('frame', (png) => {
    frameIndex++;
    const newPng = transformFn({ frameIndex }, png);
    dest.stdin.write(newPng);
  });

  src.on('end', (png) => {
    dest.stdin.end();
  });
};
