
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
        this.builder = builder; // B"H: Correctly holding the Builder.
        this.db = common.db;
        this.handle = common.handle;

        // B"H: Delegating the forces of creation and destruction to pure modules
        this.setter = new MapSetter(this);
        this.deleter = new MapDeleter(this);
    }

    /**
     * @method set
     * @description Inscribes a key and value into the B-Tree or Dictionary.
     */
    set(key, value, options) {
        return this.setter.set(key, value, options);
    }
    
    /**
     * @method delete
     * @description Withdraws a key from existence and removes its echo from the indices.
     */
    delete(key) {
        return this.deleter.delete(key);
    }
}

module.exports = MapWriter;
