
// B"H

/**
 * @file structure/manifest/complex/builder.js
 * @chapter The Builder That No Longer Mistakes Sparks For Houses
 * @description
 * Core builder. Primitive-owned values go to PrimitiveScribe first. Only true
 * containers enter the structure manifestors.
 */

const PrimitiveScribe = require('../primitive/scribe.js');
const BuilderLogic = require('./builder/logic/index.js');
const Classifier = require('./builder/classifier.js');
const PackedObjectCodec = require('../../../api/packed/objectCodec.js');
const PackedArrayCodec = require('../../../api/packed/arrayCodec.js');

/**
 * @class StructBuilder
 * @description
 * Builds any storable JavaScript value into a pointer seal.
 */
class StructBuilder {
  /**
   * @constructor
   * @param {object} allocator - Allocator vessel.
   */
  constructor(allocator) {
    this.allocator = allocator;
    this.db = allocator.db;
    this.scribe = new PrimitiveScribe(allocator);
    this.logic = new BuilderLogic(this);
  }

  /**
   * @method build
   * @description
   * Saves primitive values directly and complex values through manifestors.
   *
   * @param {*} value - Value to store.
   * @param {Map<object, Buffer>} [visited=new Map()] - Circular table.
   * @returns {Buffer} Pointer seal.
   */
  build(value, visited = new Map()) {
    if (Classifier.isPrimitiveStorageValue(value)) {
      return this.scribe.save(value);
    }

    if (this.db && this.db.options && this.db.options.packedArrays !== false) {
      const raw = PackedArrayCodec.tryEncodeDense(value, this.scribe, {
        maxLength: this.db.options.packedArrayMaxLength || 2048,
        maxBytes: this.db.options.packedArrayMaxBytes || 262 * 1024
      });
      if (raw) return this.scribe.save({ __awtsmoosPackedArray: true, raw });
    }

    if (this.db && this.db.options && this.db.options.packedObjects !== false) {
      const raw = PackedObjectCodec.tryEncodePlain(value, this.scribe, {
        maxKeys: this.db.options.packedObjectMaxKeys || 8,
        maxBytes: this.db.options.packedObjectMaxBytes || 1024,
        allowNested: false
      });
      if (raw) return this.scribe.save({ __awtsmoosPackedObject: true, raw });
    }

    if (visited.has(value)) {
      const prior = visited.get(value);
      if (prior && prior.__awtsmoosCircularEntry) {
        return prior.reference();
      }

      return prior;
    }

    const type = this.logic.determineRitual(value);
    const seal = this.logic.executeRitual(type, value, visited);

    visited.set(value, seal);

    return seal;
  }
}

module.exports = StructBuilder;
