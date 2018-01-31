/**
 * The first eight bytes of a PNG file always contain the following
 * (decimal) values:
 * 137 80 78 71 13 10 26 10
 */

const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];
const minFileLength = 9;

module.exports = (stream, onPng, onDone) => {
  let headerFound = false;
  let data = [];
  let matchedNum = 0;

  stream.on('data', (buf) => {
    for (let i = 0; i < buf.length; ++i) {
      const isFirst = buf[i] === pngSignature[0];

      // Check next byte in the sequence
      if (buf[i] === pngSignature[matchedNum]) {

        // Matched?
        if (matchedNum === pngSignature.length - 1) {
          if (data.length >= minFileLength) {
            onPng(Buffer.from(data));
          }

          data = pngSignature.slice(0);
          matchedNum = 0;
          headerFound = true;
        } else {
          matchedNum++;
        }

        continue;
      } else {
        if (matchedNum > 0) {
          data.push(...pngSignature.slice(0, matchedNum));
          matchedNum = 0;
        }

        // Might as well be a first byte
        if (buf[i] === pngSignature[0]) {
          matchedNum = 1;
          continue;
        }
      }

      if (headerFound) {
        data.push(buf[i]);
      }
    }
  });

  stream.on('end', () => {
    if (matchedNum > 0) {
      data.push(...pngSignature.slice(0, matchedNum))
    }

    if (data.length >= minFileLength) {
      onPng(Buffer.from(data));
    }

    onDone();
  });
}
