exports.measureText = (ctx, text, lineHeightStyle, w, wMode, h /* , hMode */) => {
  const measurement = ctx.measureText(text);
  let requiredWidth = measurement.width;
  const lineHeight = measurement.emHeightDescent;
  if (measurement < w) {
    return { width: requiredWidth, height: lineHeight };
  }

  let requiredLines = 1;
  let fromIndex = 0;
  let lastWordSplit = 0;

  for (let i = 0; i < text.length + 1; ++i) {
    if (i === text.length || text[i] === ' ') {
      const width = ctx.measureText(text.slice(fromIndex, i)).width;
      if (width > w) {
        requiredWidth = w;
        requiredLines++;
        fromIndex = lastWordSplit + 1;
      }

      lastWordSplit = i;
    }
  }

  let requiredHeight = requiredLines > 1
    ? lineHeight + lineHeight * (requiredLines - 1) * lineHeightStyle
    : lineHeight;

  if (requiredHeight > h) {
    requiredHeight = h;
  }

  return { width: requiredWidth, height: requiredHeight };
};

exports.splitIntoLines = (ctx, text, w) => {
  const lines = [];
  let fromIndex = 0;
  let lastWordSplit = 0;

  for (let i = 0; i < text.length + 1; ++i) {
    if (i === text.length || text[i] === ' ') {
      const width = ctx.measureText(text.slice(fromIndex, i)).width;
      if (width > w) {
        lines.push(text.slice(fromIndex, lastWordSplit));
        fromIndex = lastWordSplit + 1;
      }

      lastWordSplit = i;
    }
  }

  const remainderText = text.slice(fromIndex);
  if (remainderText.length > 0) {
    lines.push(remainderText);
  }

  return lines;
};
