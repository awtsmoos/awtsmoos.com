// B"H
const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');
const { readPointer48 } = require('../../utils/binaryHelpers.js');
const HandleRegistry = require('../../core/handleRegistry.js');

/**
 * @class GraphUtils
 * @description
 *  The Translators of the Essence. Provides identity mapping for graph nodes.
 */
class GraphUtils {
    constructor(manager) {
        this.manager = manager;
        this.db = manager.db;
        this._idCache = new Map();
        this._idCacheLimit = 2000;
    }

    /**
     * @description 
     *  Determines the unique Graph ID for a handle.
     *  B"H: Now strictly uses Pointer-based IDs for all graph operations.
     *  This ensures that a node has the same ID whether reached via the root path
     *  or an edge pointer, solving the "net.n10" vs "851_960" duality.
     */
    getId(handle) {
        if (!handle) return null;
        
        // 1. Retrieve the Internal Soul
        let h = HandleRegistry.getSoul(handle);
        
        // Fallback for cross-module boundaries
        if (!h && handle[constants.SYMBOLS.INTERNALS]) {
            h = handle[constants.SYMBOLS.INTERNALS];
        }
        
        // 2. Pointer-based identity is the global truth for the Graph index.
        // Paths are relative, but pointers are absolute addresses in the essence.
        if (h && h.ptr) {
            return this.getIdFromPtr(h.ptr);
        }

        // 3. Fallback for raw pointers or objects with ptr property
        // Must check carefully to avoid Proxy navigation traps
        try {
            if (typeof handle === 'object' && handle !== null) {
                const rawPtr = handle.ptr;
                if (Buffer.isBuffer(rawPtr)) {
                    return this.getIdFromPtr(rawPtr);
                }
            }
        } catch(e) {}
        
        return null;
    }

    /**
     * @description Generates a stable string ID from a 16-byte SmartPointer.
     */
    getIdFromPtr(ptrBuf) {
        if (!ptrBuf) return null;
        
        if (ptrBuf.isStructure === true && typeof ptrBuf.blockId === 'number') {
             return `${ptrBuf.blockId}_${ptrBuf.offset || 0}`;
        }

        if (Buffer.isBuffer(ptrBuf)) {
             const decoded = SmartPointer.decode(ptrBuf);
             if (decoded) {
                if (decoded.mode === constants.MODE_BLOCK) {
                    const blockId = readPointer48(decoded.payload, 0);
                    const offset = decoded.payload.readUInt32BE(10);
                    return `${blockId}_${offset}`;
                }
                if (decoded.mode === constants.MODE_HEAP) {
                    const blockId = readPointer48(decoded.payload, 0);
                    const offset = decoded.payload.readUInt32BE(6);
                    return `${blockId}_${offset}`;
                }
                if (decoded.mode === constants.MODE_INLINE) {
                    return `INLINE_${ptrBuf.toString('hex')}`;
                }
            }
        }
        return null;
    }

    async hydrateEdge(edge, dir) {
        const ptrBuf = (dir === 'out') ? edge.targetPtr : edge.sourcePtr;
        const type = (dir === 'out') ? edge.targetType : edge.sourceType;
        const id = (dir === 'out') ? edge.targetId : edge.sourceId;

        const otherNode = this.hydrateNodeHandle(ptrBuf, type, id);
        
        return { 
            node: otherNode, 
            label: edge.label, 
            props: edge.props, 
            direction: dir, 
            _raw: edge, 
            id 
        };
    }

    hydrateNodeHandle(ptrMaybe, typeMaybe, idMaybe) {
        if (HandleRegistry.isHandle(ptrMaybe)) return ptrMaybe;
        
        const type = typeMaybe || constants.TYPE_DICTIONARY;
        let buf = null;

        if (Buffer.isBuffer(ptrMaybe) && ptrMaybe.length === 16) {
             buf = ptrMaybe;
        } else if (ptrMaybe && ptrMaybe.isStructure === true) {
             buf = SmartPointer.block(ptrMaybe.type || type, ptrMaybe.blockId, ptrMaybe.length, ptrMaybe.isChain, ptrMaybe.offset);
        } else if (idMaybe) {
             if (idMaybe.startsWith('INLINE_')) {
                 try {
                     const hex = idMaybe.substring(7); 
                     buf = Buffer.from(hex, 'hex');
                 } catch(e) {}
             } else if (idMaybe.includes('_')) {
                 const [blockStr, offStr] = idMaybe.split('_');
                 const bid = parseInt(blockStr);
                 if(!isNaN(bid)) buf = SmartPointer.block(type, bid, 0, false, parseInt(offStr||0));
             }
        }

        if (!buf) return ptrMaybe; 
        
        return HandleRegistry.createHandle(this.db, buf, type, null);
    }
}

module.exports = GraphUtils;