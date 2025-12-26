//B"H

/**
 * @file traps.js
 * @description
 *  The Hod - Instant Splendor.
 *  Property access resolves directly to values or handles.
 */

const constants = require('../../constants.js');

module.exports = {
    createTraps: (state, target) => {
        return {
            get: (tgt, prop, receiver) => {
                if (prop === constants.SYMBOLS.INTERNALS) return state;

                if (prop === 'toString' || prop === Symbol.toPrimitive) {
                    return () => `[LiveHandle: ${state.getPath()}]`;
                }

                if (prop === 'then' || prop === 'catch' || prop === 'finally') return undefined;

                // Immediate Method Bindings
                if (prop === 'set') return state.writer.set.bind(state.writer);
                if (prop === 'delete') return state.writer.delete.bind(state.writer);
                if (prop === 'push') return state.writer.push.bind(state.writer);
                
                if (prop === 'length') return state.reader.length(); 

                const resolution = state.nav.resolveKey(prop);
                if (resolution) {
                    const SmartPointer = require('../../utils/smartPointer.js');
                    const val = SmartPointer.resolve(resolution.ptr, state.db.allocator);
                    
                    if (val && val.isStructure) {
                         const HandleRegistry = require('../../core/handleRegistry.js');
                         return HandleRegistry.createHandle(state.db, resolution.ptr, resolution.type, { parent: state.self, key: prop });
                    }
                    return val;
                }

                return state.nav.navigate(prop);
            },
            
            set: (tgt, prop, value) => {
                state.writer.set(prop, value);
                return true;
            },
            
            deleteProperty: (tgt, prop) => {
                state.writer.delete(prop);
                return true;
            }
        };
    }
};
