
// B"H

/**
 * @file api/liveHandle/reader/hydrator/scalars/function.js
 * @chapter The Verb Reopens Its Mouth
 * @description
 * Revives stored function source. If revival fails, returns a safe function.
 */

/**
 * @function reviveFunction
 * @description Revives function source.
 * @param {Buffer} buffer - Function source bytes.
 * @returns {Function} Revived function.
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
