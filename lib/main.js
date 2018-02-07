const got = require('got');
const path = require('path');
const fs = require('fs');
const prepareContent = require('./prepare-content');
const { Image, createCanvas, loadImage } = require('canvas');
const drawElements = require('./draw-elements');
const overlayVideo = require('./overlay-video');
const concatVideos = require('./concat-vidoes');
const getImages = require('./overlay/get-images');

module.exports = async json => {
  const videosToConcat = [];
  const imageSrcs = await getImages(json);
  const images = {};

  let imgIndex = 0;
  for (const imgSrc of imageSrcs) {
    const resp = await got(imgSrc);
    const img = new Image();
    const downloadName = `image-asset-${imgIndex++}${path.extname(imgSrc)}`;
    fs.writeFileSync(downloadName, resp.body);
    img.src = downloadName;
    images[imgSrc] = img;
  }

  for (const page of json.pages) {
    const fillLayers = page.layers.filter(layer => layer.template === 'fill');
    const layer = fillLayers.length > 0 ? fillLayers[0] : null;
    if (!layer) {
      continue;
    }

    const fillElement = layer.element;
    let file;
    switch (fillElement.type) {
      case 'image':
        if (fillElement.source.endsWith('.gif')) {
          file = await prepareContent.video(fillElement.source);
        } else {
          file = await prepareContent.image(fillElement.source, 3);
        }
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

      drawElements(page.layers, ctx, img.width, img.height, images);


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
