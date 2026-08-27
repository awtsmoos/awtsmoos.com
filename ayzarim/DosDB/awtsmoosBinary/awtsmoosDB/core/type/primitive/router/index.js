
// B"H
/**
 * @file index.js
 * @description Evaluates the type map efficiently.
 */

const { TYPE_ROUTER_MAP, VoidType, HeavyType } = require('./map.js');

class PrimitiveRouter {
    static route(val, context) {
        if (val === null || val === undefined) {
            return VoidType.handle(val, context);
        }
        
        const typeStr = typeof val;
        const Handler = TYPE_ROUTER_MAP[typeStr] || HeavyType;
        
        return Handler.handle(val, context);
    }
}

module.exports = PrimitiveRouter;
