
// B"H

/**
 * @file structure/manifest/complex/builder/logic/index.js
 * @chapter The Grand Order Of Emanation
 * @description
 * Small clean orchestrator.
 * Type detection lives in typeTable.
 * Manifest routing lives in ritualTable.
 */

const TypeTable = require('./typeTable.js');
const RitualTable = require('./ritualTable.js');

/**
 * @class BuilderLogic
 * @description
 * Determines and executes the structural write ritual.
 */
class BuilderLogic {
  /**
   * @constructor
   * @param {object} builder - StructBuilder instance.
   */
  constructor(builder) {
    this.builder = builder;
  }

  /**
   * @method determineRitual
   * @description
   * Finds the proper structural type for the value.
   *
   * @param {*} val - Incoming value.
   * @returns {number} VAL_TYPE.
   */
  determineRitual(val) {
    return TypeTable.detectType(val);
  }

  /**
   * @method executeRitual
   * @description
   * Writes a structure through its proper manifestor.
   *
   * @param {number} type - Target VAL_TYPE.
   * @param {*} val - Value to write.
   * @param {Map<object, Buffer>} visited - Circular reference table.
   * @returns {Buffer} Structure seal.
   */
  executeRitual(type, val, visited) {
    return RitualTable.executeRitual(this.builder, type, val, visited);
  }
}

module.exports = BuilderLogic;
