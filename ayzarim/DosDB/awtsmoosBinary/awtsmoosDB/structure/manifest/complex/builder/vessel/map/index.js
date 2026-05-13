
// B"H

/**
 * @file structure/manifest/complex/builder/vessel/map/index.js
 * @chapter The House Of Sorted Names
 * @description
 * Native Maps and Awtsmoos marker Maps both enter here.
 */

const MapEngine = require('../../../../../../structure/map/index.js');
const SmartPointer = require('../../../../../../utils/smartPointer/index.js');
const toEntries = require('./entries.js');

/**
 * @class MapManifestor
 * @description
 * Writes sorted map vessels.
 */
class MapManifestor {
  /**
   * @static
   * @method manifest
   * @description
   * Saves entries into a sorted map structure.
   *
   * @param {object} builder - StructBuilder instance.
   * @param {*} val - Native Map or marker object.
   * @param {Map<object, Buffer>} visited - Circular reference table.
   * @returns {Buffer} Map seal.
   */
  static manifest(builder, val, visited) {
    const m = new MapEngine(builder.allocator);
    m.create();

    for (const [k, v] of toEntries(val)) {
      const valSeal = builder.build(v, visited);
      m.set(k, valSeal);
    }

    return SmartPointer.toBuffer(m.ptr);
  }
}

module.exports = MapManifestor;
