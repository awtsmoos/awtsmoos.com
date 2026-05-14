
// B"H

/**
 * @file structure/manifest/complex/builder/vessel/sequence/index.js
 * @chapter The Sequence Body With The Correct Soul Name
 * @description
 * Sequence-backed structures store the same body, but return with their own
 * outer type. A native Set must return as JS_SET, not plain SEQUENCE.
 */

const Sequence = require('../../../../../../structure/sequence/index.js');
const toItems = require('./items.js');
const retagSeal = require('./typeSeal.js');

/**
 * @class SequenceManifestor
 * @description
 * Writes Array/List/Set values into sequence-backed storage.
 */
class SequenceManifestor {
  /**
   * @static
   * @method manifest
   * @description
   * Builds a sequence body and retags the pointer to the requested outer type.
   *
   * @param {object} builder - StructBuilder instance.
   * @param {*} val - Source collection.
   * @param {Map<object, Buffer>} visited - Circular table.
   * @param {number} type - Requested VAL_TYPE.
   * @returns {Buffer} Retagged sequence seal.
   */
  static manifest(builder, val, visited, type) {
    const sequence = new Sequence(builder.allocator);
    sequence.create();

    for (const item of toItems(val)) {
      const itemSeal = builder.build(item, visited);

      sequence.push(itemSeal, {
        isPtr: true
      });
    }

    return retagSeal(sequence.seal(), type);
  }
}

module.exports = SequenceManifestor;
