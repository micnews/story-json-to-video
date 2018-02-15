const { registerFont } = require('canvas');
const got = require('got');
const path = require('path');
const fs = require('fs');
const prepareContent = require('./prepare-content');
const { Image, createCanvas } = require('canvas');
const drawElements = require('./draw-elements');
const overlayVideo = require('./overlay-video');
const concatVideos = require('./concat-vidoes');
const getImages = require('./overlay/get-images');

module.exports = async (json, opts = {}) => {
  if (opts.fonts) {
    opts.fonts.forEach((font) => {
      console.log(`Registering font ${font.family}`);
      registerFont(font.source, { family: font.family });
    });
  }

  const videosToConcat = [];
  const imageSrcs = await getImages(json);
  const images = {};

  let imgIndex = 0;
  for (const imgSrc of imageSrcs) {
    console.log(`Downloading image asset ${imgSrc}`);
    const resp = await got(imgSrc);
    const img = new Image();
    const downloadName = `${opts.outputName}-image-asset-${imgIndex++}${path.extname(imgSrc)}`;
    fs.writeFileSync(downloadName, resp.body);
    img.src = downloadName;
    images[imgSrc] = img;
  }

  let pageIndex = -1;
  for (const page of json.pages) {
    pageIndex++;

    const consolePrefix = `[page ${pageIndex + 1}/${json.pages.length}]`;
    if (opts.pagesRange && !opts.pagesRange.has(pageIndex + 1)) {
      continue;
    }

    console.log(`${consolePrefix} Preparing background media`);

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
          file = await prepareContent.video(opts, pageIndex, fillElement.source);
        } else {
          file = await prepareContent.image(opts, pageIndex, fillElement.source, 3);
        }
        break;
      case 'video':
        file = await prepareContent.video(opts, pageIndex, fillElement.sources[0].source);
        break;
      default:
        // Skip other kinds of elements
        continue;
    }

    console.log(`${consolePrefix} Applying overlay`);

    let frameIndex = -1;
    const overlayFile = await overlayVideo(file, (png) => {
      frameIndex++;
      // console.log(`${consolePrefix} Processing frame ${frameIndex}`);

      const img = new Image();
      img.src = png;

      const canvas = createCanvas(img.width, img.height);
      const ctx = canvas.getContext('2d');

      ctx.drawImage(img, 0, 0, img.width, img.height);
      drawElements(page.layers, ctx, img.width, img.height, images);

      const out = canvas.toBuffer(undefined, 0, canvas.PNG_FILTER_NONE);

      if ((opts.savePosterImages || opts.posterImages) && frameIndex === 0) {
        console.log(`${consolePrefix} Saving poster image`);
        fs.writeFileSync(`${opts.outputName}-poster-${pageIndex + 1}.png`, out);
      }

      return out;
    }, opts.posterImages);

    videosToConcat.push(overlayFile);
  }

  if (!opts.posterImages && !opts.noConcat) {
    console.log('Concatenating pages');
    await concatVideos(videosToConcat, opts.outputName);
  }

  console.log('OK');
};
