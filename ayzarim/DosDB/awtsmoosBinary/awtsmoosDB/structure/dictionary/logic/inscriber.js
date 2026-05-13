
// B"H

/**
 * @file dictionary/logic/inscriber.js
 * @chapter The Scribe Who Refused To Confuse The Name With The Seal
 * @description
 * A Dictionary has two heavens:
 *
 * 1) The sorted Map-vessel where encoded keys point to stored values.
 * 2) The Sequence-vessel where Object-style insertion order is remembered.
 *
 * The old path allowed a raw Buffer-key to fall into the order Sequence.
 * But SequenceEngine treats Buffers as pointer seals, so the key's name was
 * mistaken for a physical address. The order-list then became a broken mirror:
 * "zebra" was no longer "zebra"; it was read as a pointer-shaped storm.
 *
 * This file keeps the Map key encoded, but keeps the order key as plain text.
 * The Awtsmoos gives each created vessel its exact form; this scribe must not
 * confuse the letters of the name with the place where the name is stored.
 */

const constants = require('../../../constants.js');
const SmartPointer = require('../../../utils/smartPointer/index.js');

/**
 * @function normalizeOrderKey
 * @description
 * Turns every key into the simple textual breath that belongs inside the
 * insertion-order Sequence. If a Buffer arrives, it is decoded into UTF-8 text
 * instead of being treated as a SmartPointer seal.
 *
 * @param {*} key - The key supplied by the caller.
 * @returns {string} The stable text key used for object insertion order.
 */
function normalizeOrderKey(key) {
  if (Buffer.isBuffer(key)) return key.toString('utf8');
  return String(key);
}

/**
 * @function encodeMapKey
 * @description
 * Turns the key into the binary alphabet used by the lower map engine.
 *
 * @param {*} key - The key supplied by the caller.
 * @returns {Buffer} UTF-8 encoded key bytes for map lookup/storage.
 */
function encodeMapKey(key) {
  return Buffer.from(normalizeOrderKey(key), 'utf8');
}

module.exports = {
  /**
   * @method set
   * @description
   * Overwrites or appends a key within the Dictionary.
   *
   * The Map receives encoded bytes.
   * The Sequence receives plain key text.
   *
   * This preserves the sacred distinction:
   * sorted lookup may use sealed binary letters,
   * but insertion-order memory must remember the spoken name itself.
   *
   * @param {object} engine - DictionaryEngine instance.
   * @param {*} key - User-visible dictionary key.
   * @param {Buffer} valPtr - SmartPointer seal for the stored value.
   * @param {object} [options] - Optional write flags.
   * @returns {object} New dictionary pointer location.
   */
  set(engine, key, valPtr, options) {
    const orderKey = normalizeOrderKey(key);
    const encodedKey = encodeMapKey(orderKey);
    const exists = engine.map.getPtr(encodedKey);
    const newMS = engine.map.set(encodedKey, valPtr, options);

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
