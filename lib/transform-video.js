const { spawn } = require('child_process');
const split = require('./split-png-stream');
const EventEmitter = require('events');

const w = 406;
const h = 720;
const fps = 25;

function concatListToArgs(concatList) {
  let s = '';
  let filter = ' -filter_complex ';
  let concatInputs = '';
  for (let i = 0; i < concatList.length; ++i) {
    const el = concatList[i];
    switch (el.type) {
      case 'image':
        s += ` -loop 1 -framerate 1 -t ${el.duration} -i ${el.src}`;
        break;
      case 'video':
        s += ` -i ${el.src}`;
        break;
    }

    filter += `[${i}]setdar=16:9,scale=${w}:${h}:flags=lanczos[o${i}];`;
    concatInputs += `[o${i}]`;
  }

  return s + filter + concatInputs + `concat=n=${concatList.length}:v=1:a=0`;
}

function srcStream(opts) {
  const concatArgs = concatListToArgs(opts.concatList);
  const emitter = new EventEmitter();

  const args = `-y ${concatArgs} -r ${fps} ` +
    `-an -f image2pipe -vcodec png -`;
  console.log(args.split(' ').filter(Boolean).join(' '));
  const child = spawn('ffmpeg', args.split(' ').filter(Boolean));

  split(child.stdout, (file) => {
    emitter.emit('frame', file);
  }, () => {
    emitter.emit('end');
  });

  child.stderr.on('data', (v) => {console.log(v.toString())});
  child.on('close', () => {});
  return emitter;
}

function destStream() {
  const fmt = `-vcodec libx264 -profile:v main -level 3.1 ` +
    `-r ${fps} -crf 23 -x264-params ref=4 -pix_fmt yuv420p`;
  const args = `-y -f image2pipe -vcodec png -r ${fps} -i - ${fmt} test-out.mp4`;
  const child = spawn('ffmpeg', args.split(' ').filter(Boolean));
  return child;
}

module.exports = (opts, transformFn, done) => {
  const src = srcStream(opts);
  const dest = destStream();

  let frameIndex = 0;
  src.on('frame', (png) => {
    frameIndex++;
    const newPng = transformFn({ frameIndex }, png);
    dest.stdin.write(newPng);
  });

  src.on('end', (png) => {
    dest.stdin.end();
    done();
  });
};
