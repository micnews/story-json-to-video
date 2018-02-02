const ffmpeg = require('./ffmpeg');

module.exports = async (srcs) => {
  const args = `-y
    ${srcs.map(src => `-i ${src}`).join(' ')}
    -filter_complex concat=n=${srcs.length}:v=1:a=1
    -vcodec libx264 -profile:v main -level 3.1 -preset medium
    -r 30 -vsync 2 -crf 23 -x264-params ref=4 -pix_fmt yuv420p
    -movflags +faststart test-out.mp4`;
  await ffmpeg(args);
};
