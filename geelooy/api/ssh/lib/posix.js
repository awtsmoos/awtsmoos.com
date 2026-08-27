// B"H

"use strict";

/**
 * Quotes a string for a POSIX shell command.
 *
 * @param {string} value - The value to carry through a remote shell.
 * @returns {string} A single-quoted shell token.
 */
function quote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

module.exports = { quote };
