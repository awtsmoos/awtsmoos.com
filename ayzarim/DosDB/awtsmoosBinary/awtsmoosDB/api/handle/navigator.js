
/**
 * @file navigator.js
 * @chapter The Flash of Insight (Chokhmah)
 * @description
 * Chokhmah is the seed of wisdom, the primordial flash that identifies the path.
 * When you ask the database for `db.root.users`, you are throwing a stone into 
 * the infinite void. The Navigator catches that stone, analyzes the structure 
 * of the vessel it struck (Map, Dictionary, or Flat Object), and delegates 
 * the search to the specialized Seekers.
 * 
 * Every atom of data is constantly refreshed from the Speech of the Creator.
 * As it says, "Forever, Lord, Your Word stands in the heavens." The letters
 * of His speech are physically inside these binary buffers. If the Navigator 
 * were to lose its way, the letters would scatter, and the data would instantly 
 * revert to absolute Ayin (Nothingness), as if it had never existed.
 * 
 * THE TIKKUN OF THE LOST SEEKERS:
 * We have permanently banished the `MODULE_NOT_FOUND` curse by forging 
 * ironclad pathways to the pure, data-driven Seekers.
 */

const PointerCrown = require('../../utils/pointer/crown.js');
const DictSeeker = require('../../structure/dictionary/seeker.js');
const MapSeeker = require('../../structure/map/seeker.js');
const FlatObjSeeker = require('../../structure/flat/object/seeker.js');

class Navigator {
    /**
     * @constructor
     * @param {Object} state - The internal soul-state of the LiveHandle.
     */
    constructor(state) {
        this.state = state;
        this.db = state.db;
    }

    /**
     * @method resolveKey
     * @description 
     * Descends into the abyss to identify the exact binary pointer of a specific name.
     * Uses pure data-driven routing to avoid the chaos of endless branching logic.
     * 
     * @param {string|number} key - The human name of the spark we seek.
     * @returns {Buffer|null} The raw binary seal (SmartPointer) of the found spark, or null.
     */
    resolveKey(key) {
        this.state.ensureResolved();
        const actualType = this.state.actualType;
        const actualPtr = this.state.actualPtr;

        if (!actualPtr) return null;

        // Route the query to the specific angelic seeker based on the vessel's true nature
        if (actualType === 18 || actualType === 11) { // SmartObject or Legacy Object
             return FlatObjSeeker.get(this.db, actualPtr, key);
        }
        
        if (actualType === 14) { // Dictionary
             return DictSeeker.get(this.db, actualPtr, key);
        }
        
        if (actualType === 12) { // B-Tree Map
             return MapSeeker.get(this.db, actualPtr, key);
        }

        return null;
    }

    /**
     * @method wrap
     * @description 
     * Clothes a naked, raw binary pointer into a living portal (LiveHandle).
     * This allows the user to interact with the deep binary logic as if it were 
     * a simple, casual JavaScript object.
     * 
     * @param {Buffer} ptrBuf - The raw binary seal retrieved from the abyss.
     * @param {string} key - The name that was called to summon it.
     * @returns {Proxy} The living, breathing LiveHandle proxy.
     */
    wrap(ptrBuf, key) {
        const type = PointerCrown.getType(ptrBuf);
        const Handle = require('./index.js');
        return new Handle(this.db, ptrBuf, type, { parent: this.state.self, key });
    }
}

module.exports = Navigator;
