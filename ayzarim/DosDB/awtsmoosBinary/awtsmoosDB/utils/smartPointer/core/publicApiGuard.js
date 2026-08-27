
// B"H

/**
 * @file utils/smartPointer/core/publicApiGuard.js
 * @chapter The Names That Must Never Fall Again
 * @description
 * Runtime assertion for the SmartPointer public API.
 */

const REQUIRED = [
  'encode',
  'decode',
  'readSize',
  'getType',
  'block',
  'toBuffer',
  'fromBuffer',
  'getOffset',
  'getLength',
  'resolve'
];

/**
 * @function verify
 * @description
 * Verifies public API names exist.
 *
 * @param {object} api - SmartPointer export.
 * @returns {object} Same API.
 */
function verify(api) {
  for (const name of REQUIRED) {
    if (typeof api[name] !== 'function') {
      throw new Error(`SmartPointer public API missing: ${name}`);
    }
  }

  return api;
}

module.exports = {
  REQUIRED,
  verify
};
