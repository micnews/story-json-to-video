const ffmpeg = require('./ffmpeg');

module.exports = async (srcs, outputName) => {
  const args = `-y
    ${srcs.map(src => `-f mp4 -i ${src}`).join(' ')}
    -filter_complex concat=n=${srcs.length}:v=1:a=1
    -vcodec libx264 -profile:v main -level 3.1 -preset medium
    -r 25 -crf 23 -x264-params ref=4 -pix_fmt yuv420p
    -movflags +faststart ${outputName}.mp4`;
  await ffmpeg(args);
};
