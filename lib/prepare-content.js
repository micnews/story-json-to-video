const ffmpeg = require('./ffmpeg');

const w = 606;
const h = 1080;
const fps = 25;

let nextIndex = 0;
const getName = () => `test-out${nextIndex++}.mp4`;

exports.image = async (opts, src, duration) => {
  const name = getName();
  const args = `-y
    -loop 1 -framerate 1 -t ${duration} -i ${src}
    -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 -shortest
    -r ${fps}
    -filter_complex setdar=9/16,scale=${w}:${h}:flags=lanczos
    -r ${fps}
    -acodec aac -ac 2 -ar 44100 -ab 128k
    -vcodec libx264 -vsync cfr -crf 23 -x264-params ref=4 -pix_fmt yuv420p ${name}`;
  await ffmpeg(args, opts.printFfmpeg);
  return name;
};

exports.video = async (opts, src) => {
  const name = getName();
  const args = `-y
    -i ${src}
    -r ${fps}
    -filter_complex setdar=9/16,scale=${w}:${h}:flags=lanczos
    -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100
    -shortest
    -r ${fps}
    -acodec aac -ac 2 -ar 44100 -ab 128k
    -vcodec libx264 -vsync cfr -crf 23 -x264-params ref=4 -pix_fmt yuv420p ${name}`;
  await ffmpeg(args, opts.printFfmpeg);
  return name;
};
