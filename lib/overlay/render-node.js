const yoga = require('yoga-layout');
const { Node } = yoga;
const applyStyles = require('./apply-styles');
const { measureText, splitIntoLines } = require('./text-wrap');

class RenderNode {
  constructor(canvasCtx, styles) {
    this.canvasCtx = canvasCtx;
    this.styles = styles;
    this.layoutNode = Node.create();
    applyStyles(this.layoutNode, styles);
  }

  render() {}
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
    const left = this.layoutNode.getComputedLeft();
    const top = this.layoutNode.getComputedTop();
    this.children.forEach(child => child
      .render(parentLeft + left, parentTop + top));
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

      if (styles.backgroundColor) {
        ctx.fillStyle = styles.backgroundColor;
        ctx.strokeStyle = styles.backgroundColor;

        const bgLeft = parentLeft + left + paddingLeft;
        const bgTop = parentTop + top + paddingTop;
        const bgWidth = textNoWrap.width;
        const bgHeight = textNoWrap.emHeightDescent;
        ctx.fillRect(bgLeft, bgTop + topOffset, bgWidth, bgHeight);

        if (styles.boxShadow) {
          styles.boxShadow.forEach((shadow) => {
            ctx.fillStyle = shadow.color || '#ffffff';
            ctx.fillRect(
              bgLeft + shadow.offset.x - shadow.spread,
              bgTop + topOffset + shadow.offset.y - shadow.spread,
              bgWidth + shadow.spread * 2,
              bgHeight + shadow.spread * 2
            );
          });
        }
      }

      ctx.fillStyle = this.color;
      ctx.fillText(
        line,
        parentLeft + left + paddingLeft,
        parentTop + top + paddingTop + topOffset
      );
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
    const left = this.layoutNode.getComputedLeft();
    const top = this.layoutNode.getComputedTop();
    const width = this.layoutNode.getComputedWidth();
    const height = this.layoutNode.getComputedHeight();
  }
}

exports.createNodeContainer = (canvasCtx, styles, children) => new RenderNodeContainer(
  canvasCtx, styles, children);

exports.createNodeText = (canvasCtx, styles, text) => new RenderNodeText(
  canvasCtx, styles, text);

exports.createNodeImage = (canvasCtx, styles, src, w, h) => new RenderNodeImage(
  canvasCtx, styles, src, w, h);
