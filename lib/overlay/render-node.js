const yoga = require('yoga-layout');
const { Node } = yoga;
const applyStyles = require('./apply-styles');
const { measureText, splitIntoLines } = require('./text-wrap');

function formatGradientDistance(value, defaultValue) {
  if (typeof value === 'string' && value.endsWith('%')) {
    const percentageValue = value.slice(0, -1);
    return Number(percentageValue) / 100;
  }

  return defaultValue;
}

function formatDistance(value, totalDistance) {
  if (typeof value === 'string' && value.endsWith('%')) {
    const percentageValue = value.slice(0, -1);
    return Number(percentageValue) * totalDistance / 100;
  }

  return Number(value);
}

function formatAngle(value) {
  if (typeof value === 'string' && value.endsWith('deg')) {
    return Number(value.slice(0, -3)) * Math.PI / 180;
  }

  return Number(value);
}

class RenderNode {
  constructor(canvasCtx, styles) {
    this.canvasCtx = canvasCtx;
    this.styles = styles;
    this.layoutNode = Node.create();
    applyStyles(this.layoutNode, styles);
  }

  render() {}

  _applyTransforms(left, top, width, height) {
    const { canvasCtx: ctx, styles } = this;

    ctx.save();
    if (styles.transform) {
      let tx = 0;
      let ty = 0;

      for (const t of styles.transform) {
        if (t.translateX) {
          ctx.translate(formatDistance(t.translateX, width), 0);
        }

        if (t.translateY) {
          ctx.translate(0, formatDistance(t.translateY, height));
        }

        if (t.rotate) {
          ctx.translate(left + width / 2, top + height / 2);
          ctx.rotate(formatAngle(t.rotate))
          ctx.translate(-left - width / 2, -top - height / 2);
        }
      }
    }

    if (styles.backgroundColor) {
      const paddingLeft = this.layoutNode.getComputedPadding(yoga.EDGE_LEFT);
      const paddingTop = this.layoutNode.getComputedPadding(yoga.EDGE_TOP);

      ctx.fillStyle = styles.backgroundColor;
      ctx.strokeStyle = styles.backgroundColor;

      const bgLeft = left + paddingLeft;
      const bgTop = top + paddingTop;
      ctx.fillRect(bgLeft, bgTop, width, height);

      if (styles.boxShadow) {
        styles.boxShadow.forEach((shadow) => {
          ctx.fillStyle = shadow.color || '#ffffff';
          ctx.fillRect(
            bgLeft + shadow.offset.x - shadow.spread,
            bgTop + shadow.offset.y - shadow.spread,
            width + shadow.spread * 2,
            height + shadow.spread * 2
          );
        });
      }
    }

    if (styles.backgroundLinearGradient) {
      const angle = formatAngle(styles
        .backgroundLinearGradient.direction) - 90 * Math.PI / 180;

      const radius = Math.sqrt(width * width + height * height) / 2;

      const circleCoords = [
        Math.floor(left + width / 2 - Math.cos(angle) * radius),
        Math.floor(top + height / 2 - Math.sin(angle) * radius),
        Math.floor(left + width / 2 + Math.cos(angle) * radius),
        Math.floor(top + height / 2 + Math.sin(angle) * radius)
      ];

      const gradient = ctx.createLinearGradient(
        Math.min(Math.max(0, circleCoords[0]), width),
        Math.min(Math.max(0, circleCoords[1]), height),
        Math.min(Math.max(0, circleCoords[2]), width),
        Math.min(Math.max(0, circleCoords[3]), height),
      );

      const stopCount = styles.backgroundLinearGradient.stops.length;
      for (let i = 0; i < stopCount; ++i) {
        const stop = styles.backgroundLinearGradient.stops[i];
        const ds = formatGradientDistance(stop.distance, 1 / (stopCount - 1) * i);
        gradient.addColorStop(ds, stop.color);
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(left, top, width, height);
    }
  }

  _undoTransforms() {
    const { canvasCtx: ctx } = this;
    ctx.restore();
  }
}

class RenderNodeContainer extends RenderNode {
  constructor(canvasCtx, styles, children) {
    super(canvasCtx, styles);
    this.children = children;
    children.forEach((child, i) => {
      this.layoutNode.insertChild(child.layoutNode, i);
    });
  }

  render(parentLeft, parentTop) {
    const { canvasCtx: ctx } = this;
    const left = this.layoutNode.getComputedLeft();
    const top = this.layoutNode.getComputedTop();
    const width = this.layoutNode.getComputedWidth();
    const height = this.layoutNode.getComputedHeight();
    this._applyTransforms(parentLeft + left, parentTop + top, width, height);
    this.children.forEach(child => child
      .render(parentLeft + left, parentTop + top));
    this._undoTransforms();
  }
}

class RenderNodeText extends RenderNode {
  constructor(canvasCtx, styles, text) {
    super(canvasCtx, styles);
    this.text = text;
    const lineHeight = this.styles.lineHeight || 1;
    this.layoutNode.setMeasureFunc((w, wMode, h, hMode) => {
      this._setFont();
      return measureText(canvasCtx, text, lineHeight, w, wMode, h, hMode);
    });
    this.color = styles.color || '#000000';
  }

  _setFont() {
    const { canvasCtx: ctx, styles } = this;
    const fontSize = styles.fontSize || 16;
    let fontFamily = 'Sans-serif';
    if (styles.fontFamily) {
      fontFamily = styles.fontFamily.split(',')[0];
    }

    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textBaseline = 'top';
  }

  render(parentLeft, parentTop) {
    const { canvasCtx: ctx, styles } = this;
    const left = this.layoutNode.getComputedLeft();
    const top = this.layoutNode.getComputedTop();
    const width = this.layoutNode.getComputedWidth();
    const height = this.layoutNode.getComputedHeight();
    const paddingLeft = this.layoutNode.getComputedPadding(yoga.EDGE_LEFT);
    const paddingTop = this.layoutNode.getComputedPadding(yoga.EDGE_TOP);
    const lineHeight = this.styles.lineHeight || 1;

    this._setFont();
    const lines = splitIntoLines(ctx, this.text, width);

    for (let i = 0; i < lines.length; ++i) {
      const line = lines[i];
      const textNoWrap = ctx.measureText(line);
      const topOffset = i * textNoWrap.emHeightDescent * lineHeight;
      const bgWidth = textNoWrap.width;
      const bgHeight = textNoWrap.emHeightDescent;
      this._applyTransforms(parentLeft + left, parentTop + top + topOffset,
        bgWidth, bgHeight);

      ctx.fillStyle = this.color;
      ctx.fillText(
        line,
        parentLeft + left + paddingLeft,
        parentTop + top + paddingTop + topOffset
      );

      this._undoTransforms();
    }
  }
}

class RenderNodeImage extends RenderNode {
  constructor(canvasCtx, styles, src, w, h) {
    super(canvasCtx, styles);
    this.src = src;
    this.w = w;
    this.h = h;
    this.layoutNode.setWidth(w);
    this.layoutNode.setHeight(h);
  }

  render(parentLeft, parentTop) {
    const { canvasCtx: ctx, styles } = this;
    const left = this.layoutNode.getComputedLeft();
    const top = this.layoutNode.getComputedTop();
    const width = this.layoutNode.getComputedWidth();
    const height = this.layoutNode.getComputedHeight();
    this._applyTransforms(parentLeft + left, parentTop + top, width, height);
    this._undoTransforms();
  }
}

exports.createNodeContainer = (canvasCtx, styles, children) => new RenderNodeContainer(
  canvasCtx, styles, children);

exports.createNodeText = (canvasCtx, styles, text) => new RenderNodeText(
  canvasCtx, styles, text);

exports.createNodeImage = (canvasCtx, styles, src, w, h) => new RenderNodeImage(
  canvasCtx, styles, src, w, h);
