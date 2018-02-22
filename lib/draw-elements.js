const yoga = require('yoga-layout');
const {
  createNodeContainer,
  createNodeText,
  createNodeImage,
} = require('./overlay/render-node');

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
      return acc;
    }, {});
}

function createContainer(context, containerEl, inheritedStyles) {
  const children = [];

  const containerStyles = Object.assign(
    {}, inheritedStyles,
    containerEl.styles || {},
  );

  for (const el of containerEl.elements || []) {
    const elStyles = Object.assign({}, inheritedStyles, el.styles || {});

    switch (el.type) {
      case 'container':
        children.push(createContainer(
          context, el,
          Object.assign({}, inheritedStyles, inheritStyles(el.styles)),
        ));
        break;
      case 'heading':
        children.push(createNodeText(context.ctx, elStyles, el.text));
        break;
      case 'paragraph':
        children.push(createNodeText(context.ctx, elStyles, el.text));
        break;
      case 'image':
        children.push(createNodeImage(
          context.ctx, elStyles,
          el.source, el.width || 0, el.height || 0,
        ));
        break;
      default:
        break;
    }
  }

  return createNodeContainer(context.ctx, containerStyles, children);
}

// eslint-disable-next-line no-unused-vars
function debugPrintLayoutTree(node, depth) {
  const left = node.getComputedLeft();
  const right = node.getComputedTop();
  const width = node.getComputedWidth();
  const height = node.getComputedHeight();

  const c = node.getChildCount();
  console.log(`${'  '.repeat(depth)}Node {${left}, ${right}, ${width}, ${height}}`);

  for (let i = 0; i < c; ++i) {
    debugPrintLayoutTree(node.getChild(i), depth + 1);
  }
}

module.exports = (layers, ctx, width, height, images) => {
  ctx.antialias = 'subpixel';
  ctx.patternQuality = 'best';
  ctx.imageSmoothingEnabled = true;

  const scaleFactor = 1.6;
  ctx.scale(scaleFactor, scaleFactor);

  for (const layer of layers) {
    const nodeContext = {
      ctx,
      elements: [],
      renderList: [],
    };

    const layerStyles = layer.styles || {};

    const root = createContainer(
      nodeContext, { elements: [layer], styles: { flex: 1 } },
      layerStyles,
    );

    const layoutRoot = root.layoutNode;

    layoutRoot.setWidth(width / scaleFactor);
    layoutRoot.setHeight(height / scaleFactor);
    layoutRoot.calculateLayout(width, height, yoga.DIRECTION_LTR);

    // debugPrintLayoutTree(layoutRoot, 0);
    root.render(0, 0, images);
  }
};
