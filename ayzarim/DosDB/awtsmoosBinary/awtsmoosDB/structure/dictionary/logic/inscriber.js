
// B"H

/**
 * @file dictionary/logic/inscriber.js
 * @chapter The Scribe Of Two Thrones
 * @description
 * Dictionary writing has two separate vessels:
 * the sorted map receives encoded key bytes,
 * while the object-order sequence receives plain text names.
 *
 * The earlier break happened when a Buffer key entered SequenceEngine.push().
 * SequenceEngine must treat Buffers as pointer seals for List speed.
 * Therefore the fix belongs here: never push raw encoded key Buffers into the
 * object-order sequence. Push the decoded key name.
 */

const constants = require('../../../constants.js');
const SmartPointer = require('../../../utils/smartPointer/index.js');
const toKeyText = require('./keyText.js');
const toKeyBytes = require('./keyBytes.js');

module.exports = {
  /**
   * @method set
   * @description
   * Writes one dictionary entry and preserves object insertion order.
   *
   * @param {object} engine - Dictionary engine instance.
   * @param {*} key - User key.
   * @param {Buffer} valPtr - Stored value pointer seal.
   * @param {object} [options] - Optional map flags.
   * @returns {object} Dictionary pointer location.
   */
  set(engine, key, valPtr, options) {
    const orderKey = toKeyText(key);
    const mapKey = toKeyBytes(orderKey);
    const exists = engine.map.getPtr(mapKey);
    const newMS = engine.map.set(mapKey, valPtr, options);

    if (!exists) {
      engine.seq.push(orderKey);
    }

    const newSS = SmartPointer.toBuffer(engine.seq.ptr);
    const total = 4 + 1 + newMS.length + 1 + newSS.length;
    const loc = engine.allocator.allocate(total);
    const buf = Buffer.allocUnsafe(total).fill(0);

    buf.write(constants.MAGIC_DIC, 0);

    let p = 4;
    buf.writeUInt8(newMS.length, p++);
    newMS.copy(buf, p);
    p += newMS.length;

    buf.writeUInt8(newSS.length, p++);
    newSS.copy(buf, p);

    engine.db._writeChainSafe(loc, buf);

    return {
      ...loc,
      type: constants.VAL_TYPE.DICTIONARY
    };
  }
};
