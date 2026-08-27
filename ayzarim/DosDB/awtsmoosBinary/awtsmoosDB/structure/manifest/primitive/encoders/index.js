// B"H

/**
 * @file structure/manifest/primitive/encoders/index.js
 * @chapter The Primitive Choir In Exact Order
 * @description
 * Order matters:
 * typed arrays and Buffer before generic object builders;
 * RegExp before generic object builders;
 * BigInt before number fallthrough.
 */

module.exports = [
  require('./nullish.js'),
  require('./boolean.js'),
  require('./number.js'),
  require('./bigint.js'),
  require('./encrypted.js'),
  require('./blob.js'),
  require('./compactJson.js'),
  require('./packedObject.js'),
  require('./packedArray.js'),
  require('./textToken.js'),
  require('./text.js'),
  require('./symbol.js'),
  require('./function.js'),
  require('./opaqueObject.js'),
  require('./date.js'),
  require('./buffer.js'),
  require('./error.js'),
  require('./regexp.js'),
  require('./typedArray.js')
];
