
// B"H
/**
 * @file internal.js
 * @description
 * Chapter 12: The Whispers of the Neshama (Soul)
 *
 * In the secret chambers of existence, there are names that do not belong to 
 * the common world. These names, prefixed with the seal of '_awtsmoos_', 
 * allow the seeker to peer beyond the material vessel (the binary data) 
 * into the soul of the coordinate itself.
 * 
 * "Open my eyes that I may behold wonders from Your Torah." (Psalms 119:18)
 * Just as every physical object is sustained by the constant speech of the Creator, 
 * these internal properties reveal the "letters of speech"—the metadata, 
 * the state, and the hidden structures—that make the vessel a living portal.
 *
 * This dispatcher identifies these holy prefix-markers and routes them to 
 * the Interpreters, ensuring that internal state is revealed instantly, 
 * humbled entirely before the Essence of truth.
 */

const { GetMappingDataInterpreter } = require('./interpreter.js');
const { GetLogicEmanatorMap } = require('./data.js');
const HandleRegistry = require('../../../../../../core/registry/handle.js');

/**
 * @class InternalMappingDispatcher
 * @description
 * The angel overseeing the revelation of hidden coordinates.
 * It translates requests for internal state into manifest knowledge.
 */
class InternalMappingDispatcher {
    /**
     * @constructor
     * @description
     * Prepares the vessels of understanding. It initializes the Interpreter 
     * with the sacred map of internal property emanations.
     */
    constructor() {
        /**
         * @member {GetMappingDataInterpreter}
         * @description The scribe who translates names into logic actions.
         */
        this.interpreter = new GetMappingDataInterpreter(GetLogicEmanatorMap);
    }

    /**
     * @method dispatch
     * @description
     * Evaluates a property to see if it carries the secret mark of the internal state.
     * 
     * @param {Object} target - The proxy target or state soul being inspected.
     * @param {string|symbol} property - The name of the property.
     * @param {Object} receiver - The living proxy through which the light shines.
     * @returns {any|undefined} The resolved metadata value, or undefined if no such spark exists.
     */
    dispatch(target, property, receiver) {
        // If the interpreter recognizes this name as an internal emanation
        if (this.interpreter.hasEmanation(property)) {
            const Action = this.interpreter.getAction(property);
            // Execute the action, extracting the soul from the receiver
            return Action.execute(target, property, receiver, HandleRegistry);
        }
        
        // If the property is common, we let the light pass through to the next world.
        return undefined;
    }
}

/**
 * @module InternalDispatcher
 * @description The singular instance of the internal metadata orchestrator.
 */
module.exports = new InternalMappingDispatcher();
