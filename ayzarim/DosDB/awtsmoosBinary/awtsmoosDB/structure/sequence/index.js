
// B"H

/**
 * @file sequence/index.js
 * @chapter The House Of Remembered Steps
 * @description
 * A Sequence is the path of footprints through the binary desert.
 * Every item is stored as a pointer-seal, but not every Buffer that arrives
 * should be trusted as a pointer. The caller may say:
 *
 *   push(buffer)
 *
 * and mean:
 *
 *   "store this Buffer as user data"
 *
 * not:
 *
 *   "this Buffer is already a SmartPointer"
 *
 * Therefore this vessel only accepts pointer-Buffers when options.isPtr is
 * explicit. This prevents accidental corruption of object-order lists and
 * keeps the letters of creation in their proper vessels.
 */

const constants = require('../../constants.js');
const SequenceNode = require('./node.js');
const SmartPointer = require('../../utils/smartPointer/index.js');

/**
 * @class SequenceEngine
 * @description
 * Stores an ordered list of SmartPointer seals.
 *
 * The Awtsmoos creates each instant with measure and order; this engine keeps
 * that order in the disk-world without letting a user Buffer masquerade as a
 * pointer unless the caller declares it openly.
 */
class SequenceEngine {
  /**
   * @constructor
   * @param {object} allocator - Allocator used to save/load vessels.
   * @param {object|Buffer|null} [ptr=null] - Existing sequence pointer.
   */
  constructor(allocator, ptr = null) {
    this.allocator = allocator;
    this.db = allocator.db;
    this.ptr = Buffer.isBuffer(ptr) ? SmartPointer.decode(ptr) : ptr;
    this.nodeIO = new SequenceNode(this.allocator, this);
  }

  /**
   * @method create
   * @description Creates the root sequence node.
   * @returns {Buffer} SmartPointer seal to the new sequence.
   */
  create() {
    const root = this.nodeIO.create(true);
    const pLoc = this.nodeIO.save(root);
    this.ptr = {
      ...pLoc,
      type: constants.VAL_TYPE.SEQUENCE
    };
    return SmartPointer.toBuffer(this.ptr);
  }

  /**
   * @method length
   * @description Counts items in the sequence.
   * @returns {number} Total sequence item count.
   */
  length() {
    if (!this.ptr) return 0;
    const n = this.nodeIO.load(this.ptr);
    return n ? n.totalCount : 0;
  }

  /**
   * @method seal
   * @description Returns the pointer seal for this sequence.
   * @returns {Buffer} SmartPointer seal.
   */
  seal() {
    return SmartPointer.toBuffer(this.ptr);
  }

  /**
   * @method toEntryPointer
   * @description
   * Converts a pushed value into the pointer stored in the sequence node.
   *
   * @param {*} val - Value or pointer seal.
   * @param {object} [options={}] - Push options.
   * @param {boolean} [options.isPtr=false] - True only when val is already a pointer.
   * @returns {Buffer} Pointer seal to store inside the node.
   */
  toEntryPointer(val, options = {}) {
    if (options.isPtr) return val;
    return this.allocator.save(val);
  }

  /**
   * @method push
   * @description
   * Appends one value. Buffers are saved as values unless options.isPtr is true.
   *
   * @param {*} val - Value to append, or pointer seal when options.isPtr is true.
   * @param {object} [options={}] - Push options.
   * @returns {Buffer} Updated sequence seal.
   */
  push(val, options = {}) {
    if (!this.ptr) this.create();

    const p = this.toEntryPointer(val, options);
    const root = this.nodeIO.load(this.ptr);

    root.items.push({
      ptr: p,
      count: 1
    });
    root.totalCount++;

    const pLoc = this.nodeIO.save(root);
    this.ptr = {
      ...pLoc,
      type: constants.VAL_TYPE.SEQUENCE
    };

    return SmartPointer.toBuffer(this.ptr);
  }

  /**
   * @method splice
   * @description
   * Splices pointer seals into the sequence.
   *
   * @param {number} start - Start index.
   * @param {number} del - Number of entries to delete.
   * @param {...Buffer} items - Pointer seals to insert.
   * @returns {Buffer} Updated sequence seal.
   */
  splice(start, del, ...items) {
    if (!this.ptr) this.create();

    const root = this.nodeIO.load(this.ptr);
    const entryItems = items.map(i => ({
      ptr: i,
      count: 1
    }));

    root.items.splice(start, del, ...entryItems);

    let tc = 0;
    for (const item of root.items) tc += item.count;
    root.totalCount = tc;

    const pLoc = this.nodeIO.save(root);
    this.ptr = {
      ...pLoc,
      type: constants.VAL_TYPE.SEQUENCE
    };

    return SmartPointer.toBuffer(this.ptr);
  }

  /**
   * @method getPtr
   * @description Reads the pointer seal at an index.
   * @param {number} idx - Index to read.
   * @returns {Buffer|null} Pointer seal or null.
   */
  getPtr(idx) {
    if (!this.ptr) return null;

    const root = this.nodeIO.load(this.ptr);
    if (!root || idx >= root.totalCount || idx < 0) return null;

    if (root.isLeaf) {
      return root.items[idx].ptr;
    }

    let currentIdx = idx;
    for (const item of root.items) {
      if (currentIdx < item.count) {
        const childPtr = SmartPointer.decode(item.ptr);
        const subEngine = new SequenceEngine(this.allocator, childPtr);
        return subEngine.getPtr(currentIdx);
      }
      currentIdx -= item.count;
    }

    return null;
  }

  /**
   * @method get
   * @description Resolves the value at an index.
   * @param {number} idx - Index to read.
   * @param {object} ctx - Resolution context.
   * @returns {*} Resolved value.
   */
  get(idx, ctx) {
    const p = this.getPtr(idx);
    if (!p) return undefined;
    return SmartPointer.resolve(p, this.allocator, ctx);
  }

  /**
   * @method keys
   * @description Yields numeric indexes.
   * @yields {number} Sequence index.
   */
  *keys() {
    const len = this.length();
    for (let i = 0; i < len; i++) yield i;
  }

  /**
   * @method entries
   * @description Yields index/value pairs.
   * @param {object} ctx - Resolution context.
   * @yields {[number, *]} Entry pair.
   */
  *entries(ctx) {
    const len = this.length();
    for (let i = 0; i < len; i++) {
      yield [i, this.get(i, ctx)];
    }
  }
}

module.exports = SequenceEngine;
