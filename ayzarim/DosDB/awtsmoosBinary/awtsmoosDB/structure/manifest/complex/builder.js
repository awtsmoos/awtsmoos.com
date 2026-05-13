
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

    if (visited.has(value)) {
      return visited.get(value);
    }

    const type = this.logic.determineRitual(value);
    const seal = this.logic.executeRitual(type, value, visited);

    visited.set(value, seal);

    return seal;
  }
}

module.exports = StructBuilder;
