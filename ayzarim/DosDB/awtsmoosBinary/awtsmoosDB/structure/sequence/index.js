
// B"H

/**
 * @file sequence/index.js
 * @chapter The Road That Must Stay Fast
 * @description
 * SequenceEngine is the List backbone.
 * Lists push already-saved pointer Buffers constantly.
 * Therefore Buffer-as-pointer behavior must remain.
 *
 * Object-order corruption is fixed in dictionary/logic/inscriber.js by pushing
 * text keys, not encoded Buffers. Do not slow Lists here.
 */

const constants = require('../../constants.js');
const SequenceNode = require('./node.js');
const SmartPointer = require('../../utils/smartPointer/index.js');

/**
 * @class SequenceEngine
 * @description
 * Fast ordered pointer sequence.
 */
class SequenceEngine {
  /**
   * @constructor
   * @param {object} allocator - Allocator vessel.
   * @param {object|Buffer|null} [ptr=null] - Existing pointer.
   */
  constructor(allocator, ptr = null) {
    this.allocator = allocator;
    this.db = allocator.db;
    this.ptr = Buffer.isBuffer(ptr) ? SmartPointer.decode(ptr) : ptr;
    this.nodeIO = new SequenceNode(this.allocator, this);
  }

  /**
   * @method create
   * @returns {Buffer} New sequence seal.
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
   * @returns {number} Item count.
   */
  length() {
    if (!this.ptr) return 0;
    const n = this.nodeIO.load(this.ptr);
    return n ? n.totalCount : 0;
  }

  /**
   * @method seal
   * @returns {Buffer} Current sequence seal.
   */
  seal() {
    return SmartPointer.toBuffer(this.ptr);
  }

  /**
   * @method push
   * @description
   * Appends a value.
   * Buffers are pointer seals by default because list push paths already save.
   *
   * @param {*} val - Value or pointer seal.
   * @param {object} [options={}] - Push options.
   * @returns {Buffer} Updated sequence seal.
   */
  push(val, options = {}) {
    if (!this.ptr) this.create();

    const p = (options.isPtr || Buffer.isBuffer(val))
      ? val
      : this.allocator.save(val);

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
   * @method bulkLoadPointers
   * @description
   * Builds a leaf sequence from already-saved pointer seals without repeated
   * root rewrites. Intended for fresh import/build paths.
   *
   * @param {Array<Buffer>} values - Pointer seals in desired order.
   * @returns {Buffer} Updated sequence seal.
   */
  bulkLoadPointers(values) {
    const items = Array.from(values || []).map(value => ({
      ptr: SmartPointer.toBuffer(value),
      count: 1
    }));

    const root = this.nodeIO.create(true);
    root.items = items;
    root.totalCount = items.length;

    const pLoc = this.nodeIO.save(root);
    this.ptr = {
      ...pLoc,
      type: constants.VAL_TYPE.SEQUENCE
    };

    return SmartPointer.toBuffer(this.ptr);
  }

  /**
   * @method splice
   * @param {number} start - Start index.
   * @param {number} del - Delete count.
   * @param {...Buffer} items - Pointer seals to insert.
   * @returns {Buffer} Updated seal.
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
   * @param {number} idx - Index.
   * @returns {Buffer|null} Pointer seal.
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
   * @param {number} idx - Index.
   * @param {object} ctx - Resolve context.
   * @returns {*} Resolved value.
   */
  get(idx, ctx) {
    const p = this.getPtr(idx);
    if (!p) return undefined;
    return SmartPointer.resolve(p, this.allocator, ctx);
  }

  /**
   * @method set
   * @description
   * Replaces one existing item pointer while preserving sequence length.
   *
   * @param {number} idx - Item index.
   * @param {Buffer} valPtr - Replacement pointer seal.
   * @returns {Buffer} Updated sequence seal.
   */
  set(idx, valPtr) {
    if (!this.ptr) this.create();

    const root = this.nodeIO.load(this.ptr);
    if (!root || idx < 0 || idx >= root.totalCount) {
      throw new Error(`B"H: Sequence index ${idx} is out of bounds`);
    }

    if (root.isLeaf) {
      root.items[idx] = {
        ptr: valPtr,
        count: 1
      };
    } else {
      let currentIdx = idx;

      for (const item of root.items) {
        if (currentIdx < item.count) {
          const childPtr = SmartPointer.decode(item.ptr);
          const child = new SequenceEngine(this.allocator, childPtr);
          item.ptr = child.set(currentIdx, valPtr);
          break;
        }

        currentIdx -= item.count;
      }
    }

    const pLoc = this.nodeIO.save(root);
    this.ptr = {
      ...pLoc,
      type: constants.VAL_TYPE.SEQUENCE
    };

    return SmartPointer.toBuffer(this.ptr);
  }

  /**
   * @method keys
   * @yields {number} Index.
   */
  *keys() {
    const len = this.length();
    for (let i = 0; i < len; i++) yield i;
  }

  /**
   * @method entries
   * @param {object} ctx - Resolve context.
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
