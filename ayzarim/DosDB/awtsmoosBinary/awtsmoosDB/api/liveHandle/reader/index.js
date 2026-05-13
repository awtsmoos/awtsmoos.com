
// B"H

/**
 * @file api/liveHandle/reader/index.js
 * @chapter Binah Reads The Living Bytes
 * @description
 * Reader delegates length, keys, resolution, iteration, slicing, LiveHandle
 * wrapping, and native Set resurrection.
 */

const LengthLogic = require('./logic/length.js');
const KeysLogic = require('./logic/keys.js');
const ResolverLogic = require('./resolver.js');
const IteratorLogic = require('./iterator.js');
const ContainerTypes = require('./containerTypes.js');
const Native = require('./native/index.js');

/**
 * @class Reader
 * @description
 * Read-side organ of a LiveHandle.
 */
class Reader {
  /**
   * @constructor
   * @param {object} handle - Internal LiveHandle state.
   */
  constructor(handle) {
    this.handle = handle;
    this.db = handle.db;
    this.resolver = new ResolverLogic(this);
    this.iter = new IteratorLogic(this);
  }

  /**
   * @method length
   * @returns {number} Container length.
   */
  length() {
    return LengthLogic.calculate(this.handle, this.db);
  }

  /**
   * @method resolveSelf
   * @returns {*} Fully hydrated value.
   */
  resolveSelf() {
    return this.resolver.resolveSelf();
  }

  /**
   * @method keys
   * @yields {string|number} Key.
   */
  *keys() {
    yield* KeysLogic.generate(this.handle, this.db);
  }

  /**
   * @method entries
   * @yields {[string|number, *]} Entry.
   */
  *entries() {
    yield* this.iter.entries();
  }

  /**
   * @method values
   * @yields {*} Value.
   */
  *values() {
    for (const [, v] of this.entries()) yield v;
  }

  /**
   * @method iterator
   * @yields {[string|number, *]} Entry.
   */
  *iterator() {
    yield* this.entries();
  }

  /**
   * @method slice
   * @param {number} start - Start index.
   * @param {number} [end] - End index.
   * @returns {Array<*>} Slice values.
   */
  slice(start, end) {
    const Slicer = require('./logic/slicer.js');
    return Slicer.slice(this.handle, this.db, start, end, this);
  }

  /**
   * @method _wrapIfNeeded
   * @description
   * Returns native Set for JS_SET/SET and LiveHandle for live containers.
   *
   * @param {*} val - Raw resolved value.
   * @param {string|number} key - Child key.
   * @param {Buffer|null} ptr - Optional pointer seal.
   * @returns {*} Scalar, native value, or LiveHandle.
   */
  _wrapIfNeeded(val, key, ptr) {
    if (val === null || val === undefined) return val;

    const SmartPointer = require('../../../utils/smartPointer/index.js');
    const HandleRegistry = require('../../../core/registry/handle.js');

    const isStructure = val && val.isStructure === true;
    const type = isStructure ? val.type : (ptr ? SmartPointer.getType(ptr) : 0);
    const finalPtr = ptr && Buffer.isBuffer(ptr)
      ? ptr
      : SmartPointer.toBuffer(val.ptr || val);

    const native = Native.resolveNative(
      this.db,
      type,
      finalPtr,
      {
        parent: this.handle.self,
        key
      }
    );

    if (native.hit) return native.value;

    if (!ContainerTypes.has(type)) return val;

    return HandleRegistry.createHandle(
      this.db,
      finalPtr,
      type,
      {
        parent: this.handle.self,
        key
      }
    );
  }
}

module.exports = Reader;
