
// B"H
/**
 * @file map.js
 * @class MapWriter
 * @description
 *  =============================================================================
 *  CHAPTER 17: THE ARCHANGEL OF THE MAP (TIFERET & GEVURAH)
 *  =============================================================================
 *  "And He separates between the holy and the mundane, between light and darkness." 
 *  (Havdalah, mapping the boundaries of existence).
 *  
 *  This angel directs the writing of hierarchical Maps and Dictionaries. 
 *  Rather than holding all power in a monolithic form, the MapWriter delegates 
 *  its authority to specialized scribes: the Setter (for Creation), the Deleter 
 *  (for Annihilation), and the Indexer (for Omniscience).
 * 
 *  Through Seder Hishtalshelus (the chain of emanation), the command to write 
 *  flows from the abstract JS object, through this orchestrator, down into 
 *  the specific B-Tree operations, while simultaneously updating the Semantic 
 *  and Spatial networks of the Awtsmoos.
 */

const MapSetter = require('./map_ops/setter.js');
const MapDeleter = require('./map_ops/deleter.js');

class MapWriter {
    /**
     * @constructor
     * @param {Object} common - The shared context and tools for writing.
     * @param {Object} builder - The Architect that builds structure from JS objects.
     */
    constructor(common, builder) {
        this.common = common;
        this.builder = builder;
        this.db = common.db;
        this.handle = common.handle;

        // B"H: Delegating the forces of creation and destruction to pure modules
        this.setter = new MapSetter(this);
        this.deleter = new MapDeleter(this);
    }

    /**
     * @method set
     * @description Inscribes a key and value into the B-Tree or Dictionary.
     * @param {string|Buffer} key The name of the essence.
     * @param {*} value The substance to be manifested.
     * @param {Object} options Parameters guiding the manifestation.
     */
    set(key, value, options) {
        return this.setter.set(key, value, options);
    }
    
    /**
     * @method delete
     * @description Withdraws a key from existence and removes its echo from the indices.
     * @param {string|Buffer} key The name of the essence to withdraw.
     * @returns {boolean} True if the withdrawal was successful.
     */
    delete(key) {
        return this.deleter.delete(key);
    }
}

// B"H: The physical manifestation of the constructor, ensuring it is recognized by the world.
module.exports = MapWriter;
