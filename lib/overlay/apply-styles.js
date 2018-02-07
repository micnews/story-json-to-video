const yoga = require('yoga-layout');

const convertFlexProperties = (styles) => {
  const { justifyContent, alignItems } = styles;

  if (!justifyContent) {
    return styles;
  }

  if (justifyContent) {
    styles.alignContent = styles.justifyContent;
  }

  return styles;
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

  if (styles.position) {
    switch (styles.position) {
      case 'relative':
        node.setPositionType(yoga.POSITION_TYPE_RELATIVE);
        break;
      case 'absolute':
        node.setPositionType(yoga.POSITION_TYPE_ABSOLUTE);
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

  if (styles.alignSelf) {
    switch (styles.alignSelf) {
      case 'flex-start':
        node.setAlignSelf(yoga.ALIGN_FLEX_START);
        break;
      case 'center':
        node.setAlignSelf(yoga.ALIGN_CENTER);
        break;
      case 'flex-end':
        node.setAlignSelf(yoga.ALIGN_FLEX_END);
        break;
      case 'stretch':
        node.setAlignSelf(yoga.ALIGN_STRETCH);
        break;
    }
  }

  if (styles.flexDirection) {
    switch (styles.flexDirection) {
      case 'column':
        node.setFlexDirection(yoga.FLEX_DIRECTION_COLUMN);
        break;
      case 'column-reverse':
        node.setFlexDirection(yoga.FLEX_DIRECTION_COLUMN_REVERSE);
        break;
      case 'row':
        node.setFlexDirection(yoga.FLEX_DIRECTION_ROW);
        break;
      case 'row-reverse':
        node.setFlexDirection(yoga.FLEX_DIRECTION_ROW_REVERSE);
        break;
    }
  }

  if (typeof styles.left !== 'undefined') {
    node.setPosition(yoga.EDGE_LEFT, styles.left);
  }

  if (typeof styles.top !== 'undefined') {
    node.setPosition(yoga.EDGE_TOP, styles.top);
  }

  if (typeof styles.bottom !== 'undefined') {
    node.setPosition(yoga.EDGE_BOTTOM, styles.bottom);
  }

  if (typeof styles.right !== 'undefined') {
    node.setPosition(yoga.EDGE_RIGHT, styles.right);
  }
  
  if (typeof styles.width !== 'undefined') {
    node.setWidth(styles.width);
  }

  if (typeof styles.height !== 'undefined') {
    node.setHeight(styles.height);
  }

  if (typeof styles.padding !== 'undefined') {
    node.setPadding(yoga.EDGE_ALL, styles.padding);
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

  if (typeof styles.margin !== 'undefined') {
    node.setMargin(yoga.EDGE_ALL, styles.margin);
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
};
