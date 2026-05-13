
// B"H

/**
 * @file test/lightning/sourceScaler/ruleBuilder.js
 * @chapter The Rule Smith
 * @description
 * Builds small readable source-scaling rule groups.
 */

const R = require('./regexPack.js');

/**
 * @function replaceConst
 * @description Creates a const-number replacement pair.
 * @param {string} name - Const name.
 * @param {number} from - Original value.
 * @param {number|string} to - New value.
 * @returns {[RegExp,string]} Rule pair.
 */
function replaceConst(name, from, to) {
  return [
    R.constNumber(name, from),
    `const ${name} = ${to};`
  ];
}

/**
 * @function replaceLoopLimit
 * @description Creates a loop limit replacement pair.
 * @param {string} variable - Loop variable.
 * @param {number|string} from - Original limit.
 * @param {string} toLoop - Full replacement loop header.
 * @returns {[RegExp,string]} Rule pair.
 */
function replaceLoopLimit(variable, from, toLoop) {
  return [
    R.letLoopLessThan(variable, from),
    toLoop
  ];
}

/**
 * @function replaceText
 * @description Creates a raw text replacement pair.
 * @param {string} from - Original text.
 * @param {string} to - Replacement text.
 * @returns {[RegExp,string]} Rule pair.
 */
function replaceText(from, to) {
  return [
    R.exactAssert(from),
    to
  ];
}

module.exports = {
  replaceConst,
  replaceLoopLimit,
  replaceText
};
