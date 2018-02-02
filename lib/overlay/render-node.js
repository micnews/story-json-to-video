const yoga = require('yoga-layout');
const { Node } = yoga;
const applyStyles = require('./apply-styles');

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
    this.layoutNode.setMeasureFunc((w, wMode, h, hMode) => {
      const textNoWrap = canvasCtx.measureText(text);
      return { width: textNoWrap.width, height: 20 };
    });
  }

  render(parentLeft, parentTop) {
    const { canvasCtx: ctx, styles } = this;
    const left = this.layoutNode.getComputedLeft();
    const top = this.layoutNode.getComputedTop();
    const width = this.layoutNode.getComputedWidth();
    const height = this.layoutNode.getComputedHeight();

    console.log('Render text', this.text);
    console.log('==> left ', parentLeft + left)
    console.log('==> top ', parentTop + top)

    const fontSize = styles.fontSize || 16;
    let fontFamily = 'Sans-serif';
    if (styles.fontFamily) {
      fontFamily = styles.fontFamily.split(',')[0];
    }

    const fontColor = styles.color || '#000000';
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textBaseline = 'top';

    if (styles.backgroundColor) {
      const textNoWrap = ctx.measureText(this.text);
      ctx.fillStyle = styles.backgroundColor;
      const bgLeft = parentLeft + left;
      const bgTop = parentTop + top;
      const bgWidth = textNoWrap.width;
      const bgHeight = textNoWrap.emHeightDescent;
      ctx.fillRect(bgLeft, bgTop, bgWidth, bgHeight);

      if (styles.boxShadow) {
        styles.boxShadow.forEach((shadow) => {
          ctx.fillStyle = shadow.color || '#ffffff';
          ctx.fillRect(
            bgLeft + shadow.offset.x - shadow.spread,
            bgTop + shadow.offset.y - shadow.spread,
            bgWidth + shadow.spread * 2,
            bgHeight + shadow.spread * 2
          );
        });
      }
    }

    ctx.fillStyle = fontColor;
    ctx.fillText(this.text, parentLeft + left, parentTop + top);
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

    console.log('Render image', this.src, this.w, this.h);
    console.log('==> left ', parentLeft + left)
    console.log('==> top ', parentTop + top)
  }
}

exports.createNodeContainer = (canvasCtx, styles, children) => new RenderNodeContainer(
  canvasCtx, styles, children);

exports.createNodeText = (canvasCtx, styles, text) => new RenderNodeText(
  canvasCtx, styles, text);

exports.createNodeImage = (canvasCtx, styles, src, w, h) => new RenderNodeImage(
  canvasCtx, styles, src, w, h);
