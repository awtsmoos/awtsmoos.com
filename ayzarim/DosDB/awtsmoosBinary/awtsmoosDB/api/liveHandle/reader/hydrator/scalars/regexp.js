
// B"H

/**
 * @file api/liveHandle/reader/hydrator/scalars/regexp.js
 * @chapter The Pattern Breathes Again
 * @description
 * Converts the stored JSON payload into a real RegExp, not a plain object.
 */

/**
 * @function reviveRegExp
 * @description Revives a RegExp.
 * @param {Buffer} buffer - Stored JSON bytes.
 * @returns {RegExp} RegExp instance.
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
