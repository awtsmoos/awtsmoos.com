
// B"H

/**
 * @file api/liveHandle/reader/resolver.js
 * @chapter The Reader Of Whole Forms
 * @description
 * Resolves full containers into plain JavaScript forms when explicitly asked.
 */

const constants = require('../../../constants.js');
const Hydrator = require('./hydrator/index.js');

const T = constants.VAL_TYPE;

/**
 * @function deepResolve
 * @description
 * Converts nested LiveHandle values into plain JavaScript when a caller
 * explicitly asks to resolve an entire structure.
 *
 * @param {*} value - Possible LiveHandle or scalar.
 * @returns {*} Plain resolved value.
 */
function deepResolve(value) {
  if (value && typeof value.__resolve__ === 'function') {
    return value.__resolve__();
  }

  return value;
}

/**
 * @class ResolverLogic
 * @description
 * Full value resolver for LiveHandle readers.
 */
class ResolverLogic {
  /**
   * @constructor
   * @param {object} reader - Reader instance.
   */
  constructor(reader) {
    this.reader = reader;
    this.handle = reader.handle;
    this.db = reader.db;
    this.hydrator = new Hydrator(this.db.allocator);
  }

  /**
   * @method resolveSelf
   * @description
   * Resolves this handle into native JavaScript.
   *
   * @returns {*} Resolved value.
   */
  resolveSelf() {
    this.handle.ensureResolved();

    const type = this.handle.type === T.ANCHOR
      ? (this.handle.nav.resolveAnchorInnerType() || T.DICTIONARY)
      : this.handle.type;

    const containers = new Set([
      T.SET,
      T.JS_SET,
      T.SEQUENCE,
      T.ARRAY,
      T.SMART_ARRAY,
      T.MAP,
      T.JS_MAP,
      T.DICTIONARY,
      T.OBJECT,
      T.SMART_OBJECT
    ]);

    if (!containers.has(type)) {
      return this.hydrator.hydrate(this.handle.ptr);
    }

    if (type === T.SET || type === T.JS_SET) {
      const out = new Set();
      for (const value of this.reader.values()) out.add(deepResolve(value));
      return out;
    }

    if (type === T.SEQUENCE || type === T.ARRAY || type === T.SMART_ARRAY) {
      const out = [];
      for (const value of this.reader.values()) out.push(deepResolve(value));
      return out;
    }

    if (type === T.MAP || type === T.JS_MAP) {
      const out = new Map();

      for (const [k, v] of this.reader.entries()) {
        out.set(k, deepResolve(v));
      }

      return out;
    }

    const out = {};

    for (const [k, v] of this.reader.entries()) {
      out[k] = deepResolve(v);
    }

    return out;
  }
}

module.exports = ResolverLogic;
