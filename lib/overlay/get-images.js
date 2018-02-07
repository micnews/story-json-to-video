function visitContainer(imgArray, containerEl) {
  for (const el of containerEl.elements || []) {
    switch (el.type) {
      case 'container':
        visitContainer(imgArray, el);
        break;
      case 'image':
        imgArray.push(el.source);
        break;
    }
  }
}

module.exports = async json => {
  const imgArray = [];
  for (const page of json.pages || []) {
    for (const layer of page.layers || []) {
      visitContainer(imgArray, layer);
    }
  }

  return imgArray;
};
