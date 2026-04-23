
// B"H
/**
 * @file index.js
 * @description Unites the Micro and Macro number scribes.
 */
const MicroNumberHandler = require('./micro.js');
const MacroNumberHandler = require('./macro.js');

class NumberTypeHandler {
    static handle(val, context) {
        if (Number.isInteger(val) && val >= 0 && val <= 15) {
            return MicroNumberHandler.handle(val, context);
        }
        return MacroNumberHandler.handle(val, context);
    }
}
module.exports = NumberTypeHandler;
