const { registerFont } = require('canvas');
const yoga = require('yoga-layout');
const {
  createNodeContainer,
  createNodeText,
  createNodeImage,
} = require('./overlay/render-node');

registerFont('MicSans-Bold.otf', { family: 'MicSans' });

function inheritStyles(styles) {
  const inheritable = [
    'fontFamily',
    'fontSize',
    'fontStyle',
    'textAlign',
    'color',
  ];

  return Object.keys(styles)
    .filter(key => inheritable.includes(key))
    .reduce((acc, key) => {
      acc[key] = styles[key];
    }, {});
}

function createContainer(context, containerEl, inheritedStyles) {
  const children = [];

  const containerStyles = Object.assign({}, inheritedStyles,
    containerEl.styles || {});

  for (const el of containerEl.elements) {
    const elStyles = Object.assign({}, inheritedStyles, el.styles || {});

    switch (el.type) {
      case 'container':
        children.push(
          createContainer(context, el,
            Object.assign({}, inheritedStyles, inheritStyles(el.styles))
          )
        );
        break;
      case 'heading':
        children.push(
          createNodeText(context.ctx, elStyles, el.text)
        );
        break;
      case 'paragraph':
        children.push(
          createNodeText(context.ctx, elStyles, el.text)
        );
        break;
      case 'image':
        children.push(
          createNodeImage(context.ctx, elStyles,
            el.source, el.width || 0, el.height || 0)
        );
        break;
    }
  }

  return createNodeContainer(context.ctx, containerStyles, children);
}

function debugPrintLayoutTree(node, depth) {
  const left = node.getComputedLeft();
  const right = node.getComputedTop();
  const width = node.getComputedWidth();
  const height = node.getComputedHeight();

  const c = node.getChildCount();
  console.log('  '.repeat(depth) + `Node {${left}, ${right}, ${width}, ${height}}`);

  for (let i = 0; i < c; ++i) {
    debugPrintLayoutTree(node.getChild(i), depth + 1);
  }
}

module.exports = (layers, ctx, width, height) => {
  for (const layer of layers) {
    if (layer.template !== 'vertical' && layer.template !== 'horizontal') {
      continue;
    }

    const nodeContext = {
      ctx,
      elements: [],
      renderList: [],
    };

    ctx.antialias = 'subpixel';
    ctx.patternQuality = 'best';
    ctx.imageSmoothingEnabled = false;
    ctx.filter = 'none';

    const scaleFactor = 1.6;
    ctx.scale(scaleFactor, scaleFactor);

    // TODO: this workaround tries to simulate amp-story templates,
    // which rely on the grid layout. Possibly remove remplates
    // from story-json?
    if (layer.template === 'horizontal') {
      for (const el of layer.elements) {
        el.styles = el.styles || {};
        el.styles.alignSelf = 'flex-start';
        if (el.styles.top) {
          el.styles.marginTop = el.styles.top;
        }
      }
    }

    const layerStyles = layer.styles || {};
    const root = createContainer(nodeContext, layer,
      inheritStyles(layerStyles));

    const layoutRoot = root.layoutNode;

    switch (layer.template) {
      case 'vertical':
        layoutRoot.setFlexDirection(yoga.FLEX_DIRECTION_COLUMN);
        break;
      case 'horizontal':
        layoutRoot.setFlexDirection(yoga.FLEX_DIRECTION_ROW);
        break;
    }

    layoutRoot.setWidth(width / scaleFactor);
    layoutRoot.setHeight(height / scaleFactor);
    layoutRoot.setPadding(yoga.EDGE_ALL, layerStyles.padding || 32);
    layoutRoot.calculateLayout(width, height, yoga.DIRECTION_LTR);

    // debugPrintLayoutTree(layoutRoot, 0);
    root.render(0, 0);
  }
};
