
// B"H

/**
 * @file api/liveHandle/reader/hydrator/scalars/function.js
 * @chapter The Verb Reopens Its Mouth
 * @description
 * Revives stored function source for the existing function resurrection tests.
 */

/**
 * @function reviveFunction
 * @description
 * Revives function source into a callable function.
 *
 * @param {Buffer} buffer - Function source bytes.
 * @returns {Function} Revived function or safe fallback.
 */
function reviveFunction(buffer) {
  const source = buffer.toString('utf8');

  try {
    return eval(`(${source})`);
  } catch (_err) {
    return function revivedAwtsmoosFunctionFallback() {
      return undefined;
    };
  }
}

module.exports = reviveFunction;
