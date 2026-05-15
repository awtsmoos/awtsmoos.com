
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
 *  Here, the Writer directs the specialized scribes (Maps, Sequences, and 
 *  Flat-Packers) to perform the actual inscriptions. By routing based on the 
 *  effective underlying type—peeling back the layers of Stable Anchors 
 *  if necessary—it ensure the "Will" of the mutation perfectly matches 
 *  the "Vessel" on the disk.
 */

const constants = require('../../../constants.js');
const SequenceWriter = require('./sequence.js');
const MapWriter = require('./map.js');
const WriterCommon = require('./common.js');

class Writer {
    /**
     * @constructor
     * @param {Object} handle - The internal soul-state of the LiveHandle.
     */
    constructor(handle) {
        this.handle = handle;
        this.db = handle.db;
        this.common = new WriterCommon(this);
        
        // B"H: The Tikkun of Alignment. We draw the Builder directly from the DB Essence.
        const builder = this.db.builder;
        
        this.seqWriter = new SequenceWriter(this.common, builder);
        this.mapWriter = new MapWriter(this.common, builder);
        this.flatWriter = null; // Lazy loaded to prevent circular chains
    }

    /**
     * @method _getEffectiveType
     * @private
     * @description Identifies the true face of the data, even if hidden by an Anchor (50).
     */
    _getEffectiveType() {
        const type = this.handle.type;
        if (type !== constants.VAL_TYPE.ANCHOR) return type;
        
        // Peek into the foundation to see what the anchor is protecting.
        return this.common.resolveAnchorInnerType() || constants.VAL_TYPE.DICTIONARY;
    }

    /**
     * @method _getScribe
     * @private
     * @description Identifies the proper angelic scribe based on the vessel's effective type.
     */
    _getScribe() {
        const effectiveType = this._getEffectiveType();
        const T = constants.VAL_TYPE;

        // B"H: The Tikkun of the Accordion. Route to the Flat scribes for Micro-Vessels.
        if (effectiveType === T.SMART_OBJECT || effectiveType === T.SMART_ARRAY) {
            if (!this.flatWriter) {
                const FlatWriterClass = require('./flat.js');
                this.flatWriter = new FlatWriterClass(this.common);
            }
            return this.flatWriter;
        }

        // The Lineage of the Sequential Flows (Arrays/Lists)
        const SequenceTypes = new Set([T.SEQUENCE, T.SET, T.ARRAY, T.JS_SET]);
        if (SequenceTypes.has(effectiveType)) {
            return this.seqWriter;
        }
        
        // The default world of Mappings (Objects/Maps/Dictionaries)
        return this.mapWriter;
    }

    /**
     * @method set
     * @description Materializes a key-value pair into the structure.
     */
    set(key, value, options = {}) {
        const isPtr = options === true || (options && options.isPtr);
        if (!isPtr && this.db._guardWrite) this.db._guardWrite(this._lockPath(key), value, 'set');
        if (!isPtr && this.db.turbo && this.db.turbo.captureSet(this.handle, key, value)) {
            if (this.db.indexes) this.db.indexes.afterWrite(this._lockPath(key));
            return value;
        }
        return this._autoWrite(key, () => {
            const out = this._getScribe().set(key, value, options);
            if (!isPtr && this.db.indexes) this.db.indexes.afterWrite(this._lockPath(key));
            return out;
        });
    }

    /**
     * @method push
     * @description Appends a value to a sequential container.
     */
    push(value, options = {}) {
        const effectiveType = this._getEffectiveType();
        const scribe = this._getScribe();
        
        // B"H: The Gate of Type-Awareness.
        // A Map or Dictionary cannot be "pushed" to; it is a world of keys, not queues.
        if (scribe === this.mapWriter) {
            throw new Error(`B"H Fatal: The push manifestation is only permitted on Sequences or Arrays. Current Type: ${this.handle.type} (Resolved: ${effectiveType})`);
        }
        
        return this._autoWrite('$append', () => scribe.push(value, options));
    }

    /**
     * @method splice
     * @description Slashes and heals segments of a sequence.
     */
    splice(...args) {
        const effectiveType = this._getEffectiveType();
        const scribe = this._getScribe();
        
        // A surgery on the void requires a sequence structure to connect the severed ends.
        if (scribe === this.mapWriter) {
            throw new Error(`B"H Fatal: The splice manifestation is only permitted on Sequences or Arrays. Current Type: ${this.handle.type} (Resolved: ${effectiveType})`);
        }
        
        return this._autoWrite('$range', () => scribe.splice(...args));
    }

    /**
     * @method delete
     * @description Withdraws a specific name from existence.
     */
    delete(key) {
        if (this.db._guardWrite) this.db._guardWrite(this._lockPath(key), undefined, 'delete');
        if (this.db.turbo && this.db.turbo.captureDelete(this.handle, key)) {
            if (this.db.indexes) this.db.indexes.afterWrite(this._lockPath(key));
            return true;
        }
        return this._autoWrite(key, () => {
            const out = this._getScribe().delete(key);
            if (this.db.indexes) this.db.indexes.afterWrite(this._lockPath(key));
            return out;
        });
    }

    /**
     * @method _autoWrite
     * @description Wraps ordinary sync handle mutations in an internal path lock.
     */
    _autoWrite(key, fn) {
        if (!this.db.concurrent || typeof this.db.concurrent.autoWrite !== 'function') {
            return fn();
        }

        return this.db.concurrent.autoWrite(this._lockPath(key), fn);
    }

    /**
     * @method _lockPath
     * @description Builds the logical path used by automatic mutation locks.
     */
    _lockPath(key) {
        const base = this.handle && typeof this.handle.getPath === 'function'
            ? this.handle.getPath()
            : 'root';

        return `${base}.${String(key)}`;
    }
    
    /**
     * @method compact
     * @description Triggers the auto-compaction ritual to ensure pointer alignment.
     */
    compact() {
        if (this.common._cachedEngine) {
            this.common.checkAutoCompact(this.common._cachedEngine, this._getEffectiveType());
        }
    }
}

module.exports = Writer;
