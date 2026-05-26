// B"H
'use strict';

/**
 * Chapter 3: The Awtsmoos walks through every yielded spark.
 *
 * This runtime provides both the old collected-array helper and the newer live
 * iterator bridge used when MD2 must preserve iterator close semantics. It does
 * not use eval or generated JavaScript; it only calls native or MD2 iterator
 * methods through the supplied call bridge.
 */
class Mode2IteratorRuntime {
  /**
   * @param {Array<*>} values - Lowered yield values.
   * @returns {Iterator<*>} sync iterator with optional Symbol.iterator.
   */
  createGenerator(values) {
    let i = 0;
    const it = {
      next() {
        return i < values.length
          ? { value: values[i++], done: false }
          : { value: undefined, done: true };
      }
    };
    if (typeof Symbol !== 'undefined') it[Symbol.iterator] = function iteratorSelf() { return this; };
    return it;
  }

  /**
   * @param {*} value - Iterable, iterator, array, or MD2 iterator host.
   * @param {(fn: object, args?: Array<*>, thisArg?: *) => *} callMd2 - MD2 call bridge.
   * @returns {*} live iterator object.
   */
  createIterator(value, callMd2) {
    if (value == null) return { next: () => ({ done: true }) };
    const fn = value.__iterator || (typeof Symbol !== 'undefined' && value[Symbol.iterator]);
    if (fn?.__md2fn) return callMd2(fn, [], value);
    if (typeof fn === 'function') return fn.call(value);
    if (typeof value.next === 'function') return value;
    if (Array.isArray(value)) return value[Symbol.iterator]();
    return { next: () => ({ done: true }) };
  }

  /**
   * @param {*} value - Array, native iterator host, MD2 iterator host, or nullish.
   * @param {(fn: object, args?: Array<*>, thisArg?: *) => *} callMd2 - MD2 call bridge.
   * @returns {Array<*>} collected values for compact for-of lowering.
   */
  toArray(value, callMd2) {
    if (Array.isArray(value)) return value;
    const it = this.createIterator(value, callMd2);
    const out = [];
    if (it && typeof it.next === 'function') {
      for (let step = it.next(); !step.done; step = it.next()) out.push(step.value);
    }
    return out;
  }
}

const mode2IteratorRuntime = new Mode2IteratorRuntime();

module.exports = { Mode2IteratorRuntime, mode2IteratorRuntime };
