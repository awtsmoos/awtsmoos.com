
// B"H

/**
 * @file api/liveHandle/reader/hydrator/containerTypes.js
 * @chapter The Structures That Are Not Scalars
 * @description
 * Hydrator marks structure pointers as structure descriptors. The Reader
 * decides whether direct access should return LiveHandle or native Set.
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
  T.SMART_OBJECT,
  T.SMART_ARRAY,
  T.ANCHOR
]);
