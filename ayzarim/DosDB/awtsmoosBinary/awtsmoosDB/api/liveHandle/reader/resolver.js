
// B"H

/**
 * @file api/liveHandle/reader/resolver.js
 * @chapter The Reader Of Whole Forms
 * @description
 * Resolves a LiveHandle into plain JavaScript when explicitly requested.
 * Scalars are handled by the core Hydrator; containers are walked here.
 */

const constants = require('../../../constants.js');
const Hydrator = require('./hydrator/index.js');

const T = constants.VAL_TYPE;

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
   * @description Resolves the handle root into a JavaScript value.
   * @returns {*} Resolved value.
   */
  resolveSelf() {
    this.handle.ensureResolved();

    const type = this.handle.type;
    const engine = this.handle.engine;

    if (!engine) {
      return this.hydrator.hydrate(this.handle.ptr);
    }

    if (type === T.SEQUENCE || type === T.ARRAY || type === T.SMART_ARRAY) {
      const out = [];
      for (let i = 0; i < engine.length(); i++) {
        out.push(engine.get(i, this.handle.ctx));
      }
      return out;
    }

    if (type === T.SET || type === T.JS_SET) {
      const out = new Set();
      for (let i = 0; i < engine.length(); i++) {
        out.add(engine.get(i, this.handle.ctx));
      }
      return out;
    }

    if (type === T.MAP || type === T.JS_MAP) {
      const out = new Map();
      for (const [k, v] of this.reader.entries()) {
        out.set(k, v);
      }
      return out;
    }

    const out = {};
    for (const [k, v] of this.reader.entries()) {
      out[k] = v;
    }
    return out;
  }
}

module.exports = ResolverLogic;
