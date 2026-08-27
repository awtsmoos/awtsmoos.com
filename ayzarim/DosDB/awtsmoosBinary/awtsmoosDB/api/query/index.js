// B"H
/**
 * @file index.js
 * @description Synchronous Query Execution.
 */
const FilterEvaluator = require('./evaluator.js');
const Projector = require('./projector.js');
const constants = require('../../constants.js');

class AwtsmoosQuery {
  static execute(handle, queryObj) {
    if (!queryObj) return handle;
    const h = handle && handle[constants.SYMBOLS.INTERNALS] ? handle[constants.SYMBOLS.INTERNALS] : handle;
    if (queryObj === true) return h.reader.resolveSelf();
    if (h.ensureResolved) h.ensureResolved();

    const T = constants.VAL_TYPE;
    const effectiveType = (h.type === T.ANCHOR)
      ? (h.nav.resolveAnchorInnerType() || h.type)
      : h.type;

    if (queryObj.$slice && Object.keys(queryObj).length === 1) {
      if (effectiveType === T.PACKED_ARRAY) return (h.reader.resolveSelf() || []).slice(queryObj.$slice[0], queryObj.$slice[1]);
      if (effectiveType === constants.TYPE_SEQUENCE) return h.reader.slice(queryObj.$slice[0], queryObj.$slice[1]);
    }

    const db = h.db;
    const evaluator = new FilterEvaluator(db);
    const projector = new Projector(evaluator);

    const filter = queryObj.$filter || null;
    const map = queryObj.$map || null;
    const skip = queryObj.$skip || 0;
    const limit = queryObj.$limit || Infinity;

    const results = [];
    let skipped = 0;
    let counted = 0;

    let iterator;
    if (effectiveType === constants.TYPE_SEQUENCE) {
      const len = h.reader.length();
      iterator = {
        next: (() => {
          let i = 0;
          return () => i >= len ? { done: true } : { value: { handle: h.nav.navigate(i++) }, done: false };
        })()
      };
    } else if (effectiveType === T.PACKED_ARRAY) {
      const values = h.reader.resolveSelf() || [];
      iterator = {
        next: (() => {
          let i = 0;
          return () => i >= values.length ? { done: true } : { value: values[i++], done: false };
        })()
      };
    } else if (effectiveType === constants.TYPE_MAP || effectiveType === constants.TYPE_DICTIONARY) {
      const keys = h.reader.keys();
      iterator = {
        next: (() => {
          return () => {
            const n = keys.next();
            if (n.done) return { done: true };
            return { value: { handle: h.nav.navigate(n.value) }, done: false };
          };
        })()
      };
    } else {
      iterator = h.reader.iterator();
    }

    let next = iterator.next();
    while (!next.done) {
      let itemWrapper = next.value;
      let valueToCheck = (itemWrapper && itemWrapper.handle) ? itemWrapper.handle : itemWrapper;

      if (Array.isArray(valueToCheck) && valueToCheck.length === 2 && (effectiveType === constants.TYPE_MAP || effectiveType === constants.TYPE_DICTIONARY)) {
        valueToCheck = valueToCheck[1];
      }

      let match = true;
      if (filter) match = evaluator.evaluate(valueToCheck, filter);

      if (match) {
        if (skipped < skip) {
          skipped++;
        } else {
          let output = valueToCheck;
          if (map) {
            output = projector.project(valueToCheck, map);
          } else {
            const outH = output && output[constants.SYMBOLS.INTERNALS] ? output[constants.SYMBOLS.INTERNALS] : output;
            if (outH && outH.reader) output = outH.reader.resolveSelf();
          }
          results.push(output);
          counted++;
          if (counted >= limit) break;
        }
      }
      next = iterator.next();
    }
    return results;
  }
}
module.exports = AwtsmoosQuery;
