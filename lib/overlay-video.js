const { streamPng, spawn } = require('./ffmpeg');

module.exports = async (src, frameMapper) => {
  const outName = src.replace(/\.mp4$/, '.overlay.mp4');

  const srcArgs = `-y
    -i ${src}
    -an -f image2pipe -vcodec png -`;

  const dest = spawn(`-y -i ${src} -f image2pipe -vcodec png -i -
    -map 0:a? -map 1:v
    -vsync cfr -crf 23 -x264-params ref=4 -pix_fmt yuv420p ${outName}`);

  await streamPng(srcArgs, (png) => {
    const newPng = frameMapper(png);
    dest.stdin.write(newPng);
  });

  dest.stdin.end();
  return outName;
};
