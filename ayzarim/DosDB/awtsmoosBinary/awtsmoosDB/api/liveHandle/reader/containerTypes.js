
// B"H

/**
 * @file api/liveHandle/reader/containerTypes.js
 * @chapter The Gate Of Living Vessels
 * @description
 * Lists every structure type that should stay wrapped as a LiveHandle during
 * property navigation.
 */

const constants = require('../../../constants.js');
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
