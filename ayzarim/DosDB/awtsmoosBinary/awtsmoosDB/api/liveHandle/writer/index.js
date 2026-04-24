
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
 *  Here, the Writer directs the specialized scribes (Maps, Sequences, and the new 
 *  Flat-Packers) to perform the actual inscriptions. By routing based on the 
 *  dynamic `handle.type`, it seamlessly adapts if a Flat vessel suddenly shatters 
 *  into a B-Tree mid-operation.
 */

const constants = require('../../../constants.js');
const SequenceWriter = require('./sequence.js');
const MapWriter = require('./map.js');
const WriterCommon = require('./common.js');

class Writer {
    constructor(handle) {
        this.handle = handle;
        this.db = handle.db;
        this.common = new WriterCommon(this);
        
        this.seqWriter = new SequenceWriter(this.common, this.db.allocator.builder);
        this.mapWriter = new MapWriter(this.common, this.db.allocator.builder);
        this.flatWriter = null; // Lazy loaded to prevent circular chains
    }

    _getScribe() {
        const type = this.handle.type;
        
        // B"H: The Tikkun of the Accordion. Route to the Flat scribes.
        if (type === constants.VAL_TYPE.SMART_OBJECT || type === constants.VAL_TYPE.SMART_ARRAY) {
            if (!this.flatWriter) this.flatWriter = new (require('./flat.js'))(this.common);
            return this.flatWriter;
        }

        if (type === constants.VAL_TYPE.SEQUENCE || type === constants.VAL_TYPE.SET || type === constants.VAL_TYPE.ARRAY || type === constants.VAL_TYPE.JS_SET) {
            return this.seqWriter;
        }
        
        // Maps and Dictionaries
        return this.mapWriter;
    }

    set(key, value, options = {}) {
        return this._getScribe().set(key, value, options);
    }

    push(value, options = {}) {
        const scribe = this._getScribe();
        if (scribe === this.mapWriter) {
            throw new Error(`B"H Fatal: The push manifestation is only permitted on Sequences or Arrays. Current Type: ${this.handle.type}`);
        }
        return scribe.push(value, options);
    }

    splice(...args) {
        const scribe = this._getScribe();
        if (scribe === this.mapWriter) {
            throw new Error(`B"H Fatal: The splice manifestation is only permitted on Sequences or Arrays. Current Type: ${this.handle.type}`);
        }
        return scribe.splice(...args);
    }

    delete(key) {
        return this._getScribe().delete(key);
    }
    
    compact() {
        if (this.common._cachedEngine) {
            this.common.checkAutoCompact(this.common._cachedEngine, this.handle.type);
        }
    }
}

module.exports = Writer;
