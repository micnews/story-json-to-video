const { streamPng, spawn } = require('./ffmpeg');

module.exports = async (src, frameMapper) => {
  const outName = src.replace(/\.mp4$/, '.overlay.mp4');

  const srcArgs = `-y
    -i ${src}
    -an -f image2pipe -vcodec png -`;

  const dest = spawn(`-y -i ${src} -f image2pipe -vcodec png -i -
    -map 0:a? -map 1:v
    -crf 1 -x264-params ref=4 -pix_fmt yuv420p ${outName}`);

  const waitClose = new Promise((resolve) => dest.on('close', resolve));

  await streamPng(srcArgs, (png) => {
    const newPng = frameMapper(png);
    dest.stdin.write(newPng);
  });

  dest.stdin.end();
  await waitClose;

  return outName;
};
