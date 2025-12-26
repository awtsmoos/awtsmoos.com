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
     *  Ensures that a node has a stable identity derived from its physical location.
     */
    async getId(handle) {
        if (!handle) return null;
        
        // 1. String Passthrough: If already an ID, return it.
        if (typeof handle === 'string') return handle;

        // 2. Retrieve the Internal Soul
        let h = HandleRegistry.getSoul(handle);
        if (!h && handle[constants.SYMBOLS.INTERNALS]) {
            h = handle[constants.SYMBOLS.INTERNALS];
        }
        
        if (h) {
            // 3. Absolute Resolution: Ensure we have the latest pointer.
            await h.ensureResolved();
            if (h.ptr) {
                return this.getIdFromPtr(h.ptr);
            }
        }

        // 4. Fallback for raw pointers stored in Buffers
        if (Buffer.isBuffer(handle) && handle.length === 16) {
            return this.getIdFromPtr(handle);
        }

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