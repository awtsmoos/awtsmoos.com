
// B"H

/**
 * @file api/liveHandle/reader/logic/keys.js
 * @chapter The Keys Speak Without Noise
 * @description
 * Key generation must be silent. Debug logs inside hot readers slow tests and
 * pollute failures. This module yields keys only.
 */

const constants = require('../../../../constants.js');

const T = constants.VAL_TYPE;

/**
 * @function sequenceKeys
 * @description
 * Yields numeric sequence indexes.
 *
 * @param {object} engine - Sequence engine.
 * @yields {number} Index.
 */
function* sequenceKeys(engine) {
  const length = engine.length();

  for (let i = 0; i < length; i++) {
    yield i;
  }
}

/**
 * @function mapKeys
 * @description
 * Yields map/dictionary keys.
 *
 * @param {object} engine - Map-like engine.
 * @yields {string} Key.
 */
function* mapKeys(engine) {
  if (!engine || typeof engine.keys !== 'function') return;

  for (const key of engine.keys()) {
    yield key;
  }
}

/**
 * @function generate
 * @description
 * Yields keys for a handle.
 *
 * @param {object} handle - Internal handle state.
 * @param {object} db - DB instance.
 * @yields {string|number} Key.
 */
function* generate(handle, db) {
  handle.ensureResolved();

  const type = handle.type;
  const engine = handle.engine;

  if (!engine) return;

  if (
    type === T.SEQUENCE ||
    type === T.ARRAY ||
    type === T.SMART_ARRAY ||
    type === T.SET ||
    type === T.JS_SET
  ) {
    yield* sequenceKeys(engine);
    return;
  }

  yield* mapKeys(engine, db);
}

module.exports = {
  generate
};
