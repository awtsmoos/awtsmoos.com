
// B"H

/**
 * @file test/lightning/moduleRunner/readSource.js
 * @chapter The Reader Of Test Scrolls
 * @description
 * Reads source for tests that do not have compact replacement suites.
 */

const fs = require('fs');
const sourceScaler = require('../sourceScaler/index.js');

/**
 * @function readSource
 * @description Reads JavaScript source.
 * @param {string} scriptPath - Script path.
 * @returns {string} Source text.
 */
function readSource(scriptPath) {
  return sourceScaler.transform(scriptPath, fs.readFileSync(scriptPath, 'utf8'));
}

module.exports = readSource;
