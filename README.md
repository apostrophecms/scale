# `@apostrophecms/scale`

<a href="https://apostrophecms.com/"><img src="https://raw.githubusercontent.com/apostrophecms/scale/main/logos/logo-box-madefor.png" align="right" /></a>

## Purpose

Resizing 16-megapixel images on the server side can easily DOS your server
(Denial Of Service). This module scales images appropriately in the browser
before uploading them to your server.

## Installation

```bash
npm install @apostrophecms/scale
```

## Usage

```javascript
import scale from '@apostrophecms/scale';

// See test.html for sample markup
const input = document.querySelector('#file-input');
input.addEventListener('change', async e => {
  let file = input.files[0];

  // Limit the maximum size
  file = await scale(file, {
    maxWidth: 1600,
    maxHeight: 1600
  });

  // Upload as multipart/form-data just like always
  const body = new FormData();
  body.append('file', file);
  const response = await fetch('/upload', {
    method: 'POST',
    body
  });
});
```

**The aspect ratio always stays the same.** There is no cropping, letterboxing or stretching. All we care about here is reducing file size by reducing overall dimensions.

By default, the content type stays the same (`image/jpeg` stays JPEG, `image/png` stays PNG, etc).

That's it! You're good to go.

## Fancy options

### Changing the file's content type

If you want, you can turn everything into a WebP file (depending on browser support, you may get PNG as a fallback):

```javascript
file = await scale(file, {
  maxWidth: 1600,
  maxHeight: 1600,
  type: 'image/webp'
});
```

Or, specify a mapping from type names to new type names:

```javascript
file = await scale(file, {
  maxWidth: 1600,
  maxHeight: 1600,
  type: {
    'image/gif': 'image/png',
    'image/webp': 'image/png',
    'image/png': 'image/png',
    'image/jpeg': 'image/jpeg',
  }
});
```

Or, pass your own function:

```javascript
file = await scale(file, {
  maxWidth: 1600,
  maxHeight: 1600,
  type(name) => (name === 'image/gif') ? 'image/png' : name
});
```

### Falling back to the original file

If you want, you can let the browser pass the original file in cases where scaling somehow fails:

```javascript
file = await scale(file, {
  maxWidth: 1600,
  maxHeight: 1600,
  fallback: true
});
```

Otherwise an error is thrown in this situation.

## Previewing the image

```javascript
file = await scale(file, {
  maxWidth: 1600,
  maxHeight: 1600
});

const img = document.querySelector('#my-img-element');
img.setAttribute('src', URL.createObjectURL(file));
```

`URL.createObjectURL` can turn the returned object into a suitable URL for use with `img src` or `style: background-image`.

## "What about the server side?"

That depends entirely on your language and framework of choice. If you're using
Node.js, check out [multiparty](https://www.npmjs.com/package/multiparty) and
[sharp](https://sharp.pixelplumbing.com/). Remember, you can never trust the
browser, so using a library like `sharp` to validate the images is still
important.
