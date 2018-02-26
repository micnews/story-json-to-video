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
          el.source, el.width || 0, el.height || 0, el.layout,
        ));
        break;
      default:
        break;
    }
  }

  return createNodeContainer(context.ctx, containerStyles, children);
}

function debugPrintLayoutTree(renderNode, depth) {
  const node = renderNode.layoutNode;
  const left = node.getComputedLeft();
  const right = node.getComputedTop();
  const width = node.getComputedWidth();
  const height = node.getComputedHeight();

  console.log(`${'  '.repeat(depth)}${renderNode.constructor.name} {${left}, ${right}, ${width}, ${height}} ${JSON.stringify(renderNode.styles)}`);

  if (renderNode.children) {
    renderNode.children.forEach(c => debugPrintLayoutTree(c, depth + 1));
  }
}

module.exports = (layers, ctx, width, height, images, printLayout) => {
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

    layer.styles = layer.styles || {};
    layer.styles.flex = 1;
    const root = createContainer(
      nodeContext, { elements: [layer] },
      {},
    );

    const layoutRoot = root.layoutNode;

    layoutRoot.setWidth(width / scaleFactor);
    layoutRoot.setHeight(height / scaleFactor);
    layoutRoot.calculateLayout(width, height, yoga.DIRECTION_LTR);

    if (printLayout) {
      debugPrintLayoutTree(root, 0);
    }

    root.render(0, 0, images);
  }
};
