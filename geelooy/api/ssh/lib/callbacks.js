// B"H

"use strict";

/**
 * Converts a Node-style method call into a Promise.
 *
 * @param {Function} fn - Function that receives a callback.
 * @returns {Promise<*>} The callback value.
 */
function call(fn) {
  return new Promise((resolve, reject) => {
    fn((err, value) => err ? reject(err) : resolve(value));
  });
}

module.exports = { call };
