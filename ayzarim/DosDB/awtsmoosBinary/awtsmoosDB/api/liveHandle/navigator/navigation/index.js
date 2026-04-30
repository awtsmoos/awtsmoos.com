
// B"H
/**
 * @file index.js (Navigation)
 * @chapter The Paths of Emanation (Hamshacha)
 */

const HandleRegistry = require('../../../../core/registry/handle.js');

class NavigationLogic {
    static navigate(state, key, ptr = null, type = null) {
        return HandleRegistry.createHandle(
            state.db, 
            ptr, 
            type, 
            { parent: state.self, key: key }
        );
    }
}

module.exports = NavigationLogic;
