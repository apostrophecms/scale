export default async (file, { maxWidth, maxHeight, fallback, type }) => {
  const img = new Image();
  const url = URL.createObjectURL(file);
  const ready = new Promise(resolve => {
    img.addEventListener('load', e => resolve());
    img.addEventListener('error', e => reject());
  });
  img.setAttribute('src', url);
  await ready;
  const newType = resolveType(type, file.type);
  if ((newType === file.type) && (!maxWidth || (img.width <= maxWidth)) && (!maxHeight || (img.height <= maxHeight))) {
    return file;
  }
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { alpha: true });
  let newWidth = img.width;
  let newHeight = img.height;
  if (maxWidth) {
    if (newWidth > maxWidth) {
      newWidth = maxWidth;
      newHeight = img.height * maxWidth / img.width;
    }
  }
  if (maxHeight) {
    if (newHeight > maxHeight) {
      newHeight =  maxHeight;
      newWidth = img.width * maxHeight / img.height;
    }
  }
  canvas.width = newWidth;
  canvas.height = newHeight;
  context.drawImage(img, 0, 0, newWidth, newHeight);
  const blob = await new Promise(resolve => {
    canvas.toBlob(blob => {
      if (blob) {
        return resolve(blob);
      }
      if (!fallback) {
        return reject(new Error('Could not convert canvas to blob'));
      }
      // Fall back to the original, possibly too large or
      // unsuitably typed file
      return resolve(file);
    }, resolveType(type, file.type));
  });
  return blob;
};

function resolveType(resolver, type) {
  if (!resolver) {
    return type;
  }
  if ((typeof resolver) === 'string') {
    return resolver;
  }
  if ((typeof resolver) === 'object') {
    const newType = Object.hasOwn(resolver, type) && resolver[type];
    if (!newType) {
      noType(type);
    }
  } 
  if ((typeof resolver) !== 'function') {
    throw new Error('If specified, "type" must be a string, an object or a function');
  }
  const newType = resolver(type);
  if (!newType) {
    noType(type);
  }
}

function noType() {
  throw new Error(`The type ${type} cannot be resolved to a new type`);
}

