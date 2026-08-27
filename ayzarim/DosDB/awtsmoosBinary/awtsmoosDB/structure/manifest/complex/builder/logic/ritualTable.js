
// B"H

/**
 * @file structure/manifest/complex/builder/logic/ritualTable.js
 * @chapter The Doors Of Manifestation
 * @description
 * A data-driven router from structural type to manifestor.
 * No sprawling switch.
 * No wandering branches.
 * Just names, doors, and vessels.
 */

const constants = require('../../../../../constants.js');
const SequenceManifestor = require('../vessel/sequence/index.js');
const MapManifestor = require('../vessel/map/index.js');
const DictManifestor = require('../vessel/dict/index.js');

const T = constants.VAL_TYPE;

/**
 * @function makeRituals
 * @description
 * Builds the type-to-writer table.
 *
 * @returns {Object<number, Function>} Ritual table.
 */
function makeRituals() {
  return {
    [T.SEQUENCE]: SequenceManifestor.manifest,
    [T.ARRAY]: SequenceManifestor.manifest,
    [T.SET]: SequenceManifestor.manifest,
    [T.JS_SET]: SequenceManifestor.manifest,
    [T.MAP]: MapManifestor.manifest,
    [T.JS_MAP]: MapManifestor.manifest,
    [T.DICTIONARY]: DictManifestor.manifest,
    [T.OBJECT]: DictManifestor.manifest
  };
}

/**
 * @function executeRitual
 * @description
 * Executes the correct structural manifestor.
 *
 * @param {object} builder - StructBuilder instance.
 * @param {number} type - Target VAL_TYPE.
 * @param {*} val - Value to manifest.
 * @param {Map<object, Buffer>} visited - Circular reference table.
 * @returns {Buffer} Structure pointer seal.
 */
function executeRitual(builder, type, val, visited) {
  const rituals = makeRituals();
  const ritual = rituals[type] || rituals[T.DICTIONARY];
  return ritual(builder, val, visited, type);
}

module.exports = {
  executeRitual
};
