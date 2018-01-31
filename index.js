const transformVideo = require('./lib/transform-video');
const { Image, createCanvas, loadImage } = require('canvas');

transformVideo({}, (data, png) => {
  const { frameIndex } = data;

  console.log(`Processing frame ${frameIndex}`);

  const img = new Image();
  img.src = png;

  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');

  ctx.drawImage(img, 0, 0, img.width, img.height);

  ctx.font = '30px Impact';
  ctx.translate(100, 100);
  ctx.rotate(0.1 * frameIndex);
  ctx.fillText('Testing Text Overlay', 0, 0);
  ctx.translate(0, 0);

  const out = canvas.toBuffer(undefined, 3, canvas.PNG_FILTER_NONE);

  return out;
});
