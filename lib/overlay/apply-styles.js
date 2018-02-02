const yoga = require('yoga-layout');

const convertFlexProperties = (styles) => {
  const { justifyContent, alignItems } = styles;

  if (!justifyContent && !alignItems) {
    return styles;
  }

  let stylesToReturn = { ...styles };
  if (justifyContent) {
    stylesToReturn.alignContent = styles.justifyContent;
  }

  return stylesToReturn;
};

module.exports = (node, styles) => {
  styles = convertFlexProperties(styles);

  if (styles.display) {
    switch (styles.display) {
      case 'flex':
        node.setDisplay(yoga.DISPLAY_FLEX);
        break;
      case 'none':
        node.setDisplay(yoga.DISPLAY_NONE);
        break;
    }
  }

  if (styles.justifyContent) {
    switch (styles.justifyContent) {
      case 'flex-start':
        node.setJustifyContent(yoga.JUSTIFY_FLEX_START);
        break;
      case 'flex-end':
        node.setJustifyContent(yoga.JUSTIFY_FLEX_END);
        break;
      case 'center':
        node.setJustifyContent(yoga.JUSTIFY_CENTER);
        break;
      case 'space-between':
        node.setJustifyContent(yoga.JUSTIFY_SPACE_BETWEEN);
        break;
      case 'space-around':
        node.setJustifyContent(yoga.JUSTIFY_SPACE_AROUND);
        break;
    }
  }

  if (styles.alignContent) {
    switch (styles.alignContent) {
      case 'flex-start':
        node.setAlignContent(yoga.ALIGN_FLEX_START);
        break;
      case 'flex-end':
        node.setAlignContent(yoga.ALIGN_FLEX_END);
        break;
      case 'center':
        node.setAlignContent(yoga.ALIGN_CENTER);
        break;
      case 'space-between':
        node.setAlignContent(yoga.ALIGN_SPACE_BETWEEN);
        break;
      case 'space-around':
        node.setAlignContent(yoga.ALIGN_SPACE_AROUND);
        break;
    }
  }

  if (styles.alignItems) {
    switch (styles.alignItems) {
      case 'flex-start':
        node.setAlignItems(yoga.ALIGN_FLEX_START);
        break;
      case 'center':
        node.setAlignItems(yoga.ALIGN_CENTER);
        break;
      case 'flex-end':
        node.setAlignItems(yoga.ALIGN_FLEX_END);
        break;
      case 'stretch':
        node.setAlignItems(yoga.ALIGN_STRETCH);
        break;
    }
  }
  
  if (typeof styles.width !== 'undefined') {
    node.setWidth(styles.width);
  }

  if (typeof styles.height !== 'undefined') {
    node.setHeight(styles.height);
  }

  if (typeof styles.paddingTop !== 'undefined') {
    node.setPadding(yoga.EDGE_TOP, styles.paddingTop);
  }

  if (typeof styles.paddingBottom !== 'undefined') {
    node.setPadding(yoga.EDGE_BOTTOM, styles.paddingBottom);
  }

  if (typeof styles.paddingLeft !== 'undefined') {
    node.setPadding(yoga.EDGE_LEFT, styles.paddingLeft);
  }

  if (typeof styles.paddingRight !== 'undefined') {
    node.setPadding(yoga.EDGE_RIGHT, styles.paddingRight);
  }

  if (typeof styles.padding !== 'undefined') {
    node.setPadding(yoga.EDGE_ALL, styles.padding);
  }

  if (typeof styles.marginTop !== 'undefined') {
    node.setMargin(yoga.EDGE_TOP, styles.marginTop);
  }

  if (typeof styles.marginBottom !== 'undefined') {
    node.setMargin(yoga.EDGE_BOTTOM, styles.marginBottom);
  }

  if (typeof styles.marginLeft !== 'undefined') {
    node.setMargin(yoga.EDGE_LEFT, styles.marginLeft);
  }

  if (typeof styles.marginRight !== 'undefined') {
    node.setMargin(yoga.EDGE_RIGHT, styles.marginRight);
  }

  if (typeof styles.margin !== 'undefined') {
    node.setMargin(yoga.EDGE_ALL, styles.margin);
  }
};
