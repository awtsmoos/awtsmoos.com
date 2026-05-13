
// B"H

/**
 * @file structure/manifest/complex/builder/vessel/sequence/index.js
 * @chapter The House Of Ordered Sparks
 * @description
 * Sequence vessel manifestor.
 * Arrays and Sets are both stored through SequenceEngine.
 * The outer SmartPointer type remains the requested structural type because
 * the builder anchor preserves that type.
 */

const Sequence = require('../../../../../../structure/sequence/index.js');
const toItems = require('./items.js');

/**
 * @class SequenceManifestor
 * @description
 * Writes ordered collection values.
 */
class SequenceManifestor {
  /**
   * @static
   * @method manifest
   * @description
   * Saves every item as a pointer seal and pushes it into the sequence.
   *
   * @param {object} builder - StructBuilder instance.
   * @param {*} val - Array or Set.
   * @param {Map<object, Buffer>} visited - Circular reference table.
   * @returns {Buffer} Sequence seal.
   */
  static manifest(builder, val, visited) {
    const s = new Sequence(builder.allocator);
    s.create();

    for (const item of toItems(val)) {
      const itemSeal = builder.build(item, visited);
      s.push(itemSeal, {
        isPtr: true
      });
    }

    return s.seal();
  }
}

module.exports = SequenceManifestor;
