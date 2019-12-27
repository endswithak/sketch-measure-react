const layerToBase64 = (layer: any, id: any, sketch: any) => {
  // create image buffer from layer
  const buffer = sketch.export(layer, {
    formats: 'png',
    output: false,
    ['save-for-web']: true
  });
  // create image form buffer data
  const bufferImg = new sketch.Image({
    image: buffer
  });
  // return base64 image
  return createBase64Image(bufferImg.image, id);
};

const gradientToBase64 = (layer: any, id: any, sketch: any) => {
  // get enabled gradients
  const activeGradients = layer.style.fills.filter((fill: any) => {
    return fill.enabled && fill.fillType === 'Gradient';
  });
  // get top gradient fill
  const topGradient = activeGradients[activeGradients.length - 1];
  // only keep layer gradient styles
  layer.style.fills = [topGradient];
  layer.style.borders = [];
  layer.style.shadows = [];
  layer.style.innerShadows = [];
  // turn layer into base64
  return layerToBase64(layer, id, sketch);
};

const createBase64Image = (image: any, id: string) => {
  let newImageBase64 = image.nsdata.base64EncodedStringWithOptions(0);
  let newImage = 'data:image/png;base64,' + newImageBase64;
  return {
    id: id,
    url: newImage
  }
};

const base64ImageBatch = (images: any) => {
  return images.map((image: any) => {
    return createBase64Image(image, image.id);
  });
};

export const getSelectedArtboard = (selectedPage: any) => {
  return selectedPage.layers.find((layer: any) => {
    return layer.type === 'Artboard' && layer.selected;
  });
};

const detachSymbols = (layers: any) => {
  if (layers.length > 0) {
    layers.forEach((layer: any) => {
      if (layer.type === 'Group') {
        detachSymbols(layer.layers);
      } else if (layer.type === 'SymbolInstance') {
        layer.detach({
          recursively: true
        });
      }
    });
  }
};

const flattenGroups = (layers: any, newLayers: any = []) => {
  if (layers.length > 0) {
    layers.forEach((layer: any) => {
      if (layer.type === 'Group') {
        layer.layers.forEach((childLayer: any) => {
          childLayer.frame.x = Math.round(childLayer.frame.x + layer.frame.x);
          childLayer.frame.y = Math.round(childLayer.frame.y + layer.frame.y);
          childLayer.frame.width = Math.round(childLayer.frame.width);
          childLayer.frame.height = Math.round(childLayer.frame.height);
        });
        flattenGroups(layer.layers, newLayers);
      } else {
        layer.frame.x = Math.round(layer.frame.x);
        layer.frame.y = Math.round(layer.frame.y);
        layer.frame.width = Math.round(layer.frame.width);
        layer.frame.height = Math.round(layer.frame.height);
        newLayers.push(layer);
      }
    });
  }
  return newLayers;
};

const getLayerImages = (layers: any, images: any = []) => {
  if (layers.length > 0) {
    layers.forEach((layer: any) => {
      if (layer.type === 'Group') {
        getLayerImages(layer.layers, images);
      } else if (layer.type === 'Image' && !layer.hidden) {
        images.push(layer.image);
      }
    });
  }
  return images;
};

const getFillImages = (layers: any, images: any = []) => {
  if (layers.length > 0) {
    layers.forEach((layer: any) => {
      if (layer.type === 'Group') {
        getFillImages(layer.layers, images);
      } else if (layer.style.fills.length > 0 && !layer.hidden) {
        layer.style.fills.forEach((fill: any) => {
          if (fill.pattern.image !== null && fill.enabled) {
            images.push(fill.pattern.image);
          }
        });
      }
    });
  }
  return images;
};

const generateBase64Gradients = (layers: any, sketch: any, images: any = []) => {
  if (layers.length > 0) {
    layers.forEach((layer: any) => {
      if (layer.type === 'Group') {
        generateBase64Gradients(layer.layers, sketch, images);
      } else if (layer.style.fills.length > 0 && !layer.hidden) {
        // check if fills contain any enabled gradients
        const hasActiveGradient = layer.style.fills.some((fill: any) => {
          return fill.fillType === 'Gradient' && fill.enabled;
        });
        // generate gradient base64
        if (hasActiveGradient) {
          // create duplicate
          const duplicate = layer.duplicate();
          // create base64 from duplicate layer
          const base64Gradient = gradientToBase64(duplicate, layer.id, sketch);
          // push base64 gradient to images
          images.push(base64Gradient);
        }
      }
    });
  }
  return images;
};

const generateBase64Images = (layers: any) => {
  // get layers to turn into base64
  const layerImages: any = getLayerImages(layers);
  const fillImages: any = getFillImages(layers);
  // generate base64 images from layers
  const base64LayerImages: any = base64ImageBatch(layerImages);
  const base64FillImages: any = base64ImageBatch(fillImages);
  // return final base64 image store
  return [...base64LayerImages, ...base64FillImages];
};

const generateImageStore = (layers: any, sketch: any) => {
  const images = generateBase64Images(layers);
  const gradients = generateBase64Gradients(layers, sketch)
  return [...images, ...gradients];
}

export const getStore = (sketch: any, selectedArtboard: any) => {
  // duplicate artboard
  let artboard = selectedArtboard.duplicate();
  // clear artboard frame
  artboard.frame.x = 0;
  artboard.frame.y = 0;
  // detach symbols from duplicate artboard layers
  detachSymbols(artboard.layers);
  // flatten artboard layer groups
  const newLayers = flattenGroups(artboard.layers);
  // generate base64 images from layers
  const images = generateImageStore(newLayers, sketch);
  // set artboard layers
  artboard.layers = newLayers;
  // delete duplicate artboard
  artboard.remove();
  // return final store
  return {
    artboard,
    images
  };
};


// export const flattenGroups = (layers: any, newArray: any) => {
//   if (layers.length > 0) {
//     layers.forEach((layer: any) => {
//       if (layer.type === 'Group') {
//         flattenGroups(layer.layers, newArray);
//       } else {
//         newArray.push(layer);
//       }
//     });
//   }
//   return newArray;
// };

// const getLayerImages = (layers: any) => {
//   const layerImages: any = [];
//   layers.forEach((layer: any) => {
//     if (layer.type === 'Image' && !layer.hidden) {
//       layerImages.push(layer.image);
//     }
//   });
//   return layerImages;
// };

// const getFillImages = (layers: any) => {
//   const fillImages: any = [];
//   layers.forEach((layer: any) => {
//     if (layer.style.fills.length > 0 && !layer.hidden) {
//       layer.style.fills.forEach((fill: any) => {
//         if (fill.pattern.image !== null && fill.enabled) {
//           fillImages.push(fill.pattern.image);
//         }
//       });
//     }
//   });
//   return fillImages;
// };

// export const generateBase64Gradients = (layers: any, dom: any) => {
//   const base64Gradients: any = [];
//   //const flattendLayers = flattenGroups(layers, []);
//   layers.forEach((layer: any) => {
//     const { style } = layer;
//     // check if fills contain any enabled gradients
//     const hasActiveGradient = style.fills.some((fill: any) => {
//       return fill.fillType === 'Gradient' && fill.enabled;
//     });
//     // generate gradient base64
//     if (hasActiveGradient) {
//       // duplicate layer
//       const gradientDuplicate = layer.duplicate();
//       // remove all styles but the gradient fill
//       // create base64 from duplicate layer
//       const base64Gradient = gradientToBase64(gradientDuplicate, style.id, dom);
//       // push base64 gradient to master
//       base64Gradients.push(base64Gradient);
//       // remove duplicate layer
//       gradientDuplicate.remove();
//     }
//   });
//   return base64Gradients;
// };