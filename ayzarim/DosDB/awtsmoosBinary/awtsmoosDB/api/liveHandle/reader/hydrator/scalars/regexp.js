
// B"H

/**
 * @file api/liveHandle/reader/hydrator/scalars/regexp.js
 * @chapter The Pattern Breathes Again
 * @description
 * RegExp must return as a living RegExp instance with .test(), not as a plain
 * object, not as JSON, not as a dead dictionary mask.
 */

/**
 * @function reviveRegExp
 * @description
 * Revives a stored regular expression.
 *
 * @param {Buffer} buffer - JSON payload containing source and flags.
 * @returns {RegExp} Revived RegExp.
 */
function reviveRegExp(buffer) {
  try {
    const data = JSON.parse(buffer.toString('utf8'));
    return new RegExp(data.source, data.flags);
  } catch (_err) {
    return new RegExp('');
  }
}

module.exports = reviveRegExp;
