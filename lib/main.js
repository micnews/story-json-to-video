const prepareContent = require('./prepare-content');
const { Image, createCanvas } = require('canvas');
const drawElements = require('./draw-elements');
const overlayVideo = require('./overlay-video');
const concatVideos = require('./concat-vidoes');

module.exports = async json => {
  const videosToConcat = [];

  for (page of json.pages) {
    const fillLayers = page.layers.filter(layer => layer.template === 'fill');
    const layer = fillLayers.length > 0 ? fillLayers[0] : null;
    if (!layer) {
      continue;
    }

    const fillElement = layer.element;
    let file;
    switch (fillElement.type) {
      case 'image':
        file = await prepareContent.image(fillElement.source, 1);
        break;
      case 'video': {
        file = await prepareContent.video(fillElement.sources[0].source);
        break;
      }
    }

    const overlayFile = await overlayVideo(file, (png) => {
      console.log(`Processing frame`);

      const img = new Image();
      img.src = png;

      const canvas = createCanvas(img.width, img.height);
      const ctx = canvas.getContext('2d');

      ctx.drawImage(img, 0, 0, img.width, img.height);

      drawElements(page.layers, ctx, img.width, img.height);


      const out = canvas.toBuffer(undefined, 0, canvas.PNG_FILTER_NONE);

      // require('fs').writeFileSync('out.png', out)
      // process.exit(0);

      return out;
    });

    // return;
    videosToConcat.push(overlayFile);
  }

  await concatVideos(videosToConcat);
};
