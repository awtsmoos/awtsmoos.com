
// B"H

/**
 * @file api/liveHandle/reader/hydrator/regexp.js
 * @chapter The Pattern Returns
 * @description
 * Revives stored regular expressions.
 */

/**
 * @function reviveRegExp
 * @description Hydrates a RegExp from JSON bytes.
 * @param {Buffer} buffer - Stored JSON bytes.
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
