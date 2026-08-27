
// B"H

/**
 * @file utils/rootRequire.js
 * @chapter The Root Path That Does Not Lie
 * @description
 * Deep modules should not keep guessing how many ../../ steps reach the root.
 * This tiny vessel makes root-relative require paths stable forever.
 */

const path = require('path');

/**
 * @constant ROOT
 * @description
 * Absolute awtsmoosDB root directory.
 */
const ROOT = path.join(__dirname, '..');

/**
 * @function rootPath
 * @description
 * Resolves a file path relative to the awtsmoosDB root folder.
 *
 * @param {...string} parts - Path pieces from the project root.
 * @returns {string} Absolute path.
 */
function rootPath(...parts) {
  return path.join(ROOT, ...parts);
}

/**
 * @function rootRequire
 * @description
 * Requires a module relative to the awtsmoosDB root folder.
 *
 * @param {...string} parts - Path pieces from the project root.
 * @returns {*} Required module.
 */
function rootRequire(...parts) {
  return require(rootPath(...parts));
}

rootRequire.path = rootPath;
rootRequire.ROOT = ROOT;

module.exports = rootRequire;
