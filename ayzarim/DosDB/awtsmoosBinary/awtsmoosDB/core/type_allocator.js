// B"H
/**
 * @file type_allocator.js
 * @description
 *  The Sefirah of Chesed (Kindness) — The Infinite Flow of Manifestation.
 * 
 *  This scroll governs the manifestation of values into physical storage.
 *  REWRITTEN: 
 *  1. Fixes String Type mismatch (ensuring OMNI is used if packed).
 *  2. Completes the Custom Instance (Class) ritual.
 *  3. Integrates with the StructBuilder for fractal complexes.
 */

const constants = require('../constants.js');
const SmartPointer = require('../utils/smartPointer.js');
const omni = require('../utils/omniCompressor.js');
const serializer = require('../utils/serializer.js');
const fs = require('fs');

class AllocatorV2 {
    constructor(pager, db) {
        this.pager = pager;
        this.db = db;
        // Ancestral block manager
        this.v1 = new (require('./allocator/index.js'))(pager, db);
        // The Heap for small binary sparks
        this.heap = new (require('./heap.js'))(this.v1);
        // The Builder for recursive fractal structures
        this.builder = new (require('../utils/structBuilder.js'))(this);
    }

    /**
     * @description Scribe's witness to the physical manifestation.
     */
    _log(msg) {
        if (this.db && this.db.debug) {
            try { fs.writeSync(2, `\x1b[36mB"H [TYPE_ALLOC] ${msg}\x1b[0m\n`); } catch(e) {}
        }
    }

    init() { this.v1.init(); }

    readHeapBlock(blockId) {
        const fromMemory = this.heap.readBlock(blockId);
        if (fromMemory) return fromMemory;
        return this.v1.readBlockLocked(blockId, true);
    }

    /**
     * @description Saves a value, choosing the most efficient vessel.
     */
    save(val) {
        const T = constants.VAL_TYPE;
        
        // --- 1. PRIMITIVES IN THE VOID ---
        if (val === null) return SmartPointer.encode(T.NULL, constants.MODE_INLINE, Buffer.alloc(15));
        if (val === undefined) return SmartPointer.encode(T.UNDEFINED, constants.MODE_INLINE, Buffer.alloc(15));
        if (typeof val === 'boolean') {
            const p = Buffer.alloc(15).fill(0); p[0] = val ? 1 : 0;
            return SmartPointer.encode(T.BOOLEAN, constants.MODE_INLINE, p);
        }
        
        // SMALL_INT Optimization (0-15)
        if (typeof val === 'number' && Number.isInteger(val) && val >= 0 && val <= 15) {
            const p = Buffer.alloc(15).fill(0); p[0] = val;
            return SmartPointer.encode(T.SMALL_INT, constants.MODE_INLINE, p);
        }

        // --- 2. THE SPOKEN WORD (STRINGS) ---
        if (typeof val === 'string') {
            const hasMarker = val.includes('\x07');
            // B"H: CRITICAL FIX - If we use omni.pack (which doubles markers), 
            // we MUST label the type as STRING_OMNI (6) so the hydrator knows to unpack it.
            const data = omni.pack(val);
            const type = hasMarker ? T.STRING_OMNI : T.STRING;

            if (data.length <= 14) {
                const p = Buffer.alloc(15).fill(0); p[0] = data.length; data.copy(p, 1);
                return SmartPointer.encode(type, constants.MODE_INLINE, p);
            }
            
            const ptr = this.v1.allocate(data.length);
            this.db._writeChainSafe(ptr, data);
            return SmartPointer.block(type, ptr.blockId, data.length, !!ptr.isChain, ptr.offset);
        }

        // --- 3. FRACTAL COMPLEXES ---
        // Native Handles and explicit markers are redirected.
        if (val && typeof val === 'object') {
            if (val[constants.SYMBOLS.INTERNALS]) {
                const soul = val[constants.SYMBOLS.INTERNALS];
                soul.ensureResolved();
                return soul.ptr || SmartPointer.encode(T.NULL, constants.MODE_INLINE, Buffer.alloc(15));
            }
        }

        // Standard objects/arrays go to the recursive Builder.
        if (typeof val === 'object' && val !== null && !Buffer.isBuffer(val) && !ArrayBuffer.isView(val)) {
             return this.builder.build(val);
        }

        // --- 4. BINARY MATERIAL AND NUMERIC ESSENCE ---
        const info = require('./allocator/serialize/serializeValue.js')(val, false);
        const data = info.data;
        if (!data || data.length === 0) return SmartPointer.encode(T.NULL, constants.MODE_INLINE, Buffer.alloc(15));

        if (data.length <= 1024) {
            const loc = this.heap.allocate(data);
            return SmartPointer.heap(info.type, loc.blockId, loc.offset, loc.length);
        }
        
        const p = this.v1.allocate(data.length);
        this.db._writeChainSafe(p, data);
        return SmartPointer.block(info.type, p.blockId, data.length, !!p.isChain, p.offset);
    }

    /**
     * @description B"H: The ritual of saving a Custom Class Instance.
     * Encapsulates name, source code, and a Dictionary of properties.
     */
    _saveCustomInstance(obj, visited) {
        this._log(`Starting Custom Instance Ritual for: ${obj.constructor.name}`);
        const T = constants.VAL_TYPE;
        const name = obj.constructor.name;
        const source = obj.constructor.toString();
        
        // 1. Prepare Metadata
        const nameBuf = Buffer.from(name, 'utf8');
        const sourceBuf = Buffer.from(source, 'utf8');
        
        // 2. Pre-allocate the header block so we have a physical anchor for 'visited'
        const totalLenHeader = (1 + nameBuf.length) + (1 + sourceBuf.length) + 16; 
        const p = this.v1.allocate(totalLenHeader);
        const seal = SmartPointer.block(T.CUSTOM_INSTANCE, p.blockId, totalLenHeader, !!p.isChain, p.offset);
        
        // 3. ANCHOR THE SOUL IMMEDIATELY
        // This prevents infinite recursion if the class instance is circular.
        visited.set(obj, seal);

        // 4. Build the properties into a Dictionary
        // We use a clean object copy to avoid constructor-logic interference
        const props = {};
        for(const k of Object.keys(obj)) props[k] = obj[k];
        const dictSeal = this.builder.build(props, visited);
        
        // 5. Manifest the complete binary body
        const buf = Buffer.allocUnsafe(totalLenHeader);
        let off = 0;
        
        off += serializer.writeVarIntTo(buf, off, nameBuf.length);
        nameBuf.copy(buf, off); off += nameBuf.length;
        
        off += serializer.writeVarIntTo(buf, off, sourceBuf.length);
        sourceBuf.copy(buf, off); off += sourceBuf.length;
        
        dictSeal.copy(buf, off); 

        // 6. Seal the body into the physical blocks
        this.db._writeChainSafe(p, buf);
        
        this._log(`Class Resurrection Vessel Manifested at Block ${p.blockId}`);
        return seal;
    }

    flushHeap() { this.heap.flush(); }
}

module.exports = AllocatorV2;