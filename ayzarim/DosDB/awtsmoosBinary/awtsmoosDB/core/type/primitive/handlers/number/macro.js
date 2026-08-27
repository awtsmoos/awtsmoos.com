
// B"H
/**
 * @file macro.js
 * @description Heavy magnitudes passed to the Heavy Handler.
 */
const HeavyTypeHandler = require('../heavy/index.js');

class MacroNumberHandler {
    static handle(val, context) {
        return HeavyTypeHandler.handle(val, context);
    }
}
module.exports = MacroNumberHandler;
