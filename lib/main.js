const transformVideo = require('./transform-video');
const { Image, createCanvas } = require('canvas');

module.exports = json => new Promise((resolve, reject) => {
  const concatList = [];

  for (page of json.pages) {
    const fillLayers = page.layers.filter(layer => layer.template === 'fill');
    const layer = fillLayers.length > 0 ? fillLayers[0] : null;
    if (!layer) {
      continue;
    }

    const fillElement = layer.element;
    switch (fillElement.type) {
      case 'image':
        concatList.push({ type: 'image', src: fillElement.source, duration: 5 });
        break;
      case 'video': {
        concatList.push({ type: 'video', src: fillElement.sources[0].source });
        break;
      }
      default:
        break;
    }
  }

  transformVideo({ concatList }, (data, png) => {
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
  }, resolve);
});
