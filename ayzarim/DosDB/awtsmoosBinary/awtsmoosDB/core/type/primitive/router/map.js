
// B"H
/**
 * @file map.js
 * @description
 *  =============================================================================
 *  CHAPTER 8: THE PURE TYPE ROUTER MAP
 *  =============================================================================
 *  Maps the `typeof` strings to their respective angelic handlers.
 */

const VoidType = require('../handlers/void/index.js');
const BooleanType = require('../handlers/boolean/index.js');
const NumberType = require('../handlers/number/index.js');
const StringType = require('../handlers/string/omni.js');
const HeavyType = require('../handlers/heavy/index.js');

const TYPE_ROUTER_MAP = {
    'boolean': BooleanType,
    'number': NumberType,
    'string': StringType,
    'bigint': HeavyType,
    'symbol': HeavyType,
    'function': HeavyType,
    'object': HeavyType 
};

module.exports = { TYPE_ROUTER_MAP, VoidType, HeavyType };
