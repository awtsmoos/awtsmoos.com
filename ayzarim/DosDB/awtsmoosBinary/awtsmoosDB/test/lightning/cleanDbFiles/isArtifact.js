
// B"H

/**
 * @file test/lightning/cleanDbFiles/isArtifact.js
 * @chapter The Name Of The Dust
 * @description
 * Recognizes DB artifacts by suffix.
 */

const suffixes = require('./suffixes.js');

/**
 * @function isArtifact
 * @description Checks whether a file name is a DB artifact.
 * @param {string} name - File name.
 * @returns {boolean} True when DB artifact.
 */
function isArtifact(name) {
  return suffixes.some(s => name.endsWith(s));
}

module.exports = isArtifact;
