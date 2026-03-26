
// B"H
/**
 * @file index.js
 * @class Writer
 * @description
 *  =============================================================================
 *  CHAPTER 7: THE SEFIRAH OF NETZACH (VICTORY AND ETERNAL PERSISTENCE)
 *  =============================================================================
 *  "Forever, O Lord, Your word stands firm in the heavens." (Psalms 119:89)
 *  
 *  Just as the Creator's ten statements of Genesis never faded, but constantly
 *  reverberate within the physical fabric of reality—where the letters 
 *  Aleph-Beis-Nun continuously manifest the 'Even' (stone) from the absolute 
 *  Void (Ayin)—this Writer module is the angel of Netzach. It takes the fleeting, 
 *  ephemeral thoughts of JavaScript (the abstract Will) and etches them permanently 
 *  into the binary stone of the disk.
 * 
 *  If the letters of the Creator's speech were to withdraw for a single microsecond, 
 *  the stone would not merely crumble; it would revert to absolute nothingness, 
 *  as if it had never existed, along with all dimensions of time. Therefore, the 
 *  Writer must act with absolute precision, immediately committing the soul 
 *  to the physical block.
 * 
 *  Here, the Writer directs the specialized scribes (Maps and Sequences) to 
 *  perform the actual inscriptions. Through a data-driven recognition of the 
 *  vessel's type, it avoids the chaos of branching logic, channeling the Light 
 *  directly to its appropriate physical receptacle.
 */

const constants = require('../../../constants.js');
const SequenceWriter = require('./sequence.js');
const MapWriter = require('./map.js');
const WriterCommon = require('./common.js');

/**
 * @class Writer
 * @description The Master Scribe that channels modifications into the physical persistence layer.
 */
class Writer {
    /**
     * @constructor
     * @param {Object} handle - The LiveHandle representing the soul's current incarnation.
     */
    constructor(handle) {
        this.handle = handle;
        this.db = handle.db;
        this.common = new WriterCommon(this);
        
        this.seqWriter = new SequenceWriter(this.common, this.db.allocator.builder);
        this.mapWriter = new MapWriter(this.common, this.db.allocator.builder);

        /**
         * @property {Object} WriteStrategies
         * @description A data-driven map connecting the abstract type of the vessel 
         * to the specific angelic scribe designated to write it. Eliminating the 
         * impurity of infinite switch statements.
         */
        this.WriteStrategies = {
            [constants.VAL_TYPE.SEQUENCE]: this.seqWriter,
            [constants.VAL_TYPE.SET]: this.seqWriter,
            [constants.VAL_TYPE.ARRAY]: this.seqWriter,
            [constants.VAL_TYPE.MAP]: this.mapWriter,
            [constants.VAL_TYPE.DICTIONARY]: this.mapWriter,
            [constants.VAL_TYPE.OBJECT]: this.mapWriter
        };
    }

    /**
     * @method _getScribe
     * @description Seeks the appropriate scribe for the current vessel type.
     * @returns {Object} The delegated writer instance.
     */
    _getScribe() {
        const scribe = this.WriteStrategies[this.handle.type];
        if (!scribe) {
            // Defaulting to the Map Writer for generic objects if unmapped
            return this.mapWriter;
        }
        return scribe;
    }

    /**
     * @method set
     * @description Binds a key to a value in the physical realm.
     * @param {string|Buffer} key The name of the essence.
     * @param {*} value The substance to be manifested.
     * @param {Object} options Parameters guiding the manifestation (e.g., skipping the Builder).
     */
    set(key, value, options = {}) {
        return this._getScribe().set(key, value, options);
    }

    /**
     * @method push
     * @description Appends a new spark to the end of a Sequence.
     * @param {*} value The data to manifest.
     * @param {Object} options Options for the writing ritual (CRITICAL FIX: Passed down to sequence writer).
     * @returns {number} The new length of the sequence.
     */
    push(value, options = {}) {
        const scribe = this._getScribe();
        if (scribe !== this.seqWriter) {
            throw new Error(`B"H Fatal: The push manifestation is only permitted on Sequences, Arrays, or Sets. Current Type: ${this.handle.type}`);
        }
        // B"H: The options object is now faithfully transmitted, carrying the {isPtr: true} 
        // directive from the Search Indexer so the raw physical ID is not re-wrapped.
        return scribe.push(value, options);
    }

    /**
     * @method splice
     * @description The surgical alteration of the Sequence timeline.
     * @param {...*} args The coordinates and sparks for the insertion/deletion.
     * @returns {Array} The displaced sparks.
     */
    splice(...args) {
        const scribe = this._getScribe();
        if (scribe !== this.seqWriter) {
            throw new Error(`B"H Fatal: The splice manifestation is only permitted on Sequences, Arrays, or Sets. Current Type: ${this.handle.type}`);
        }
        return scribe.splice(...args);
    }

    /**
     * @method delete
     * @description The Tzimtzum (Contraction) - withdrawing the light and annihilating the data.
     * @param {string|number} key The coordinate to obliterate.
     * @returns {boolean} True if the void was successfully established.
     */
    delete(key) {
        return this._getScribe().delete(key);
    }
    
    /**
     * @method compact
     * @description Re-evaluates the physical layout of the vessel to ensure optimal density.
     */
    compact() {
        if (this.common._cachedEngine) {
            this.common.checkAutoCompact(this.common._cachedEngine, this.handle.type);
        }
    }
}

module.exports = Writer;
