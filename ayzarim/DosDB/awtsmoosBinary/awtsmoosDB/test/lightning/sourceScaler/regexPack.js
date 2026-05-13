
// B"H

/**
 * @file test/lightning/sourceScaler/regexPack.js
 * @chapter The Flexible Sword
 * @description
 * Regex helpers for minified or pretty test files.
 * The tests in this folder are often one huge line, so exact formatting rules
 * are too brittle. These helpers match spaces, semicolons, and compact loops.
 */

/**
 * @function constNumber
 * @description Builds a regex for a numeric const assignment.
 * @param {string} name - Constant name.
 * @param {number} value - Original numeric value.
 * @returns {RegExp} Replacement regex.
 */
function constNumber(name, value) {
  return new RegExp(`const\\s+${name}\\s*=\\s*${value}\\s*;`, 'g');
}

/**
 * @function letLoopLessThan
 * @description Builds regex for for(let i=0; i<N; i++) prefix.
 * @param {string} variable - Loop variable.
 * @param {number|string} limit - Loop limit.
 * @returns {RegExp} Replacement regex.
 */
function letLoopLessThan(variable, limit) {
  return new RegExp(
    `for\\s*\\(\\s*let\\s+${variable}\\s*=\\s*0\\s*;\\s*${variable}\\s*<\\s*${limit}\\s*;\\s*${variable}\\+\\+\\s*\\)`,
    'g'
  );
}

/**
 * @function exactAssert
 * @description Builds regex for a specific assert text.
 * @param {string} raw - Raw assert text.
 * @returns {RegExp} Escaped global regex.
 */
function exactAssert(raw) {
  return new RegExp(raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
}

module.exports = {
  constNumber,
  letLoopLessThan,
  exactAssert
};
