
// B"H
/**
 * @file index.js (Mapping Dispatcher)
 * @chapter Chapter 10: The Sorting of the Gevurah (Boundaries)
 *
 * @description
 * Like it says "Forever, Lord, Your Word stands in the heavens".
 * The Speech of the Creator established boundaries between the holy and the mundane, 
 * between internal soul-state and external data-methods.
 * 
 * This Dispatcher oversees the Mapping handles (Maps and Dictionaries). 
 * When a thought (a property access) enters this hall, we first determine if it is
 * an internal secret of the Awtsmoos (beginning with _awtsmoos_) or a 
 * recognized method of the world (like .get, .set, .size).
 * 
 * RECTIFICATION (TIKKUN): We have restored the flow of the GetAction, 
 * ensuring it perfectly implements the .execute ritual required for 
 * method mapping, and we prioritized the internal property lookup.
 */

const SetAction = require('./set/index.js');
const DeleteAction = require('./delete/index.js');
const HasAction = require('./has/index.js');
const KeysAction = require('./keys/index.js');
const ValuesAction = require('./values/index.js');
const EntriesAction = require('./entries/index.js');
const SizeAction = require('./size/index.js');
const GetAction = require('./get/index.js');

/**
 * @class MappingDispatcher
 * @description 
 * Orchestrates the behavior of Maps and Dictionaries, ensuring both 
 * methods and internal state are revealed with absolute precision.
 */
class MappingDispatcher {
    /**
     * @method dispatch
     * @description
     * Determines which command to fulfill. 
     * Prioritizes internal soul-states, then structural iterators, then standard methods.
     * 
     * @param {Object} state - The handle soul.
     * @param {string|symbol} prop - The name sought.
     * @param {Object} receiver - The proxy vessel.
     * @returns {any|undefined}
     */
    static dispatch(state, prop, receiver) {
        // 1. Secrets of the Soul (Internal property check)
        const internalProp = GetAction.dispatch(state, prop, receiver);
        if (internalProp !== undefined) return internalProp;

        // 2. Divine Path of Iteration
        if (prop === Symbol.iterator) {
            return state.reader.iterator.bind(state.reader);
        }

        /** @type {Object} The Mapping between Method Names and Logic Entities */
        const methodMap = {
            'set':     SetAction.execute(state, receiver),
            'delete':  DeleteAction.execute(state),
            'has':     HasAction.execute(state),
            'keys':    KeysAction.execute(state),
            'values':  ValuesAction.execute(state),
            'entries': EntriesAction.execute(state),
            'size':    SizeAction.execute(state),
            'get':     GetAction.execute(state, receiver)
        };

        // 3. Command Recognition (Check if the name is a known method)
        if (Object.prototype.hasOwnProperty.call(methodMap, prop)) {
            return methodMap[prop];
        }

        // Return to the abyss of uncertainty (next level trap)
        return undefined;
    }
}

module.exports = MappingDispatcher;
