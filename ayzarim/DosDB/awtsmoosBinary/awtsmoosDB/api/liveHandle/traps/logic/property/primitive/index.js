
// B"H
/**
 * @file index.js (Primitive Unwrapping)
 * @description Extracts the absolute numerical or verbal essence instantly.
 */
const HandleRegistry = require('../../../../../../core/registry/handle.js');

class PrimitiveResolver {
    static resolve(handle) {
        const nextState = HandleRegistry.getSoul(handle);
        if (!nextState) return undefined;
        return nextState.reader.resolveSelf();
    }
}
module.exports = PrimitiveResolver;
