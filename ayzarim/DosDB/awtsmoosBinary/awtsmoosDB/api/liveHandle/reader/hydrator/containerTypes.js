
// B"H

/**
 * @file api/liveHandle/reader/hydrator/containerTypes.js
 * @chapter The Vessels That Must Stay Live
 * @description
 * Containers return LiveHandle structure descriptors. Scalars return real
 * JavaScript values.
 */

const rootRequire = require('./root.js');
const constants = rootRequire('constants.js');
const T = constants.VAL_TYPE;

module.exports = new Set([
  T.MAP,
  T.JS_MAP,
  T.SEQUENCE,
  T.DICTIONARY,
  T.SET,
  T.JS_SET,
  T.OBJECT,
  T.ARRAY,
  T.JSON,
  T.SMART_OBJECT,
  T.SMART_ARRAY,
  T.ANCHOR
]);
