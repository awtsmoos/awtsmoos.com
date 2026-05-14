
// B"H

/**
 * @file api/liveHandle/reader/containerTypes.js
 * @chapter The Live Vessels
 * @description
 * Types that remain LiveHandle-backed during normal property navigation.
 * Native JS_SET and SET are intentionally excluded because direct access should
 * resurrect a real Set.
 */

const constants = require('../../../constants.js');
const T = constants.VAL_TYPE;

module.exports = new Set([
  T.MAP,
  T.JS_MAP,
  T.SEQUENCE,
  T.DICTIONARY,
  T.OBJECT,
  T.ARRAY,
  T.SMART_OBJECT,
  T.SMART_ARRAY,
  T.ANCHOR
]);
