
/**
 * @file orchestrator.js
 * @chapter The Seal of Eternal Endurance (Netzach)
 * @description
 * Netzach represents the "Victory" of persistence. 
 * When a developer speaks into the JavaScript handle—saying "Let there be light at root.key"—
 * this Orchestrator catches that will and carves it into the binary stone.
 * 
 * If the current vessel is too small for the intense light of the data,
 * the Orchestrator commands the structure to expand, grow, and if necessary,
 * relocate its physical coordinates while the Anchor (Yesod) keeps the 
 * spiritual identity stable.
 *
 * THE RECTIFICATION (TIKKUN):
 * We ensure that 'this.db.builder' is accessed reliably. If the builder 
 * has not yet been manifested in the specific world-path, we reach back 
 * into the Core to pull its blueprints.
 */

const Pointer = require('../../../utils/pointer/crown.js');
const constants = require('../../../constants.js');

class WriterOrchestrator {
    /**
     * @constructor
     * @param {Object} state - The internal soul-state of the LiveHandle.
     */
    constructor(state) {
        this.state = state;
        this.db = state.db;
    }

    /**
     * @method set
     * @description Materializes a name-value pair into the structure.
     * @param {string|Buffer} key - The binary key or human string name.
     * @param {*} value - The abstract thought/data to persist.
     */
    set(key, value, options = {}) {
        // Ensure the Handle has revealed its true underlying structure (thru Anchor/Yesod)
        this.state.ensureResolved();

        // THE TIKKUN: Access the builder from the database nucleus
        const builder = this.db.builder;
        if (!builder) {
            throw new Error("B\"H Fatal: The Master Builder is missing from this world.");
        }

        // 1. Build the child vessel and get its coordinate seal (Crown)
        // This is recursive: if the value is an object, it triggers its own building.
        const childSeal = builder.build(value);

        // 2. Locate the specific structural logic for our current vessel
        const type = this.state.actualType;
        const ptr = this.state.actualPtr;

        /** @type {Object} Delegate to the specific structural scribe based on Type ID */
        const Scribes = {
            [constants.VAL_TYPE.DICTIONARY]: () => require('../../../structure/dictionary/index.js'),
            [constants.VAL_TYPE.MAP]: () => require('../../../structure/map/index.js'),
            [constants.VAL_TYPE.SMART_OBJECT]: () => require('../../../structure/flat/object/index.js')
        };

        const ScribeClass = Scribes[type] ? Scribes[type]() : Scribes[constants.VAL_TYPE.DICTIONARY]();
        
        // 3. Command the structural scribe to update the mapping
        const engine = new ScribeClass(this.db.allocator, ptr);
        const newDataPtr = engine.set(key, childSeal, { isPtr: true, ...options });

        // 4. If the structure has relocated to accommodate the growth, update the anchor.
        if (this.state.type === constants.VAL_TYPE.ANCHOR) {
             const Anchor = require('../../../structure/anchor/stable.js');
             const anchorManager = new Anchor(this.db);
             anchorManager.update(this.state.ptr, type, newDataPtr);
        }
    }

    /**
     * @method delete
     * @description Withdraws the light from a specific name, leaving it empty.
     * @param {string} key - The key to excise.
     */
    delete(key) {
        this.state.ensureResolved();
        // [Withdrawal logic implemented in specific structural scribes]
    }
}

module.exports = WriterOrchestrator;
