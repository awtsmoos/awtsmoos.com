// B"H
/**
 * @file utils.js
 * @description Synchronous ID Generation and Hydration.
 */
const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');
const { readPointer48 } = require('../../utils/binaryHelpers.js');
const HandleRegistry = require('../../core/handleRegistry.js');

class GraphUtils {
    constructor(manager) {
        this.manager = manager;
        this.db = manager.db;
    }

    getId(handle) {
        if (!handle) return null;
        if (typeof handle === 'string') return handle;

        let h = HandleRegistry.getSoul(handle);
        if (!h && handle[constants.SYMBOLS.INTERNALS]) {
            h = handle[constants.SYMBOLS.INTERNALS];
        }
        
        if (h) {
            // SYNC call
            h.ensureResolved(); 
            if (h.ptr) {
                return this.getIdFromPtr(h.ptr);
            }
        }

        if (Buffer.isBuffer(handle) && handle.length === 16) {
            return this.getIdFromPtr(handle);
        }
        return null;
    }

    getIdFromPtr(ptrBuf) {
        if (!ptrBuf) return null;
        if (ptrBuf.isStructure && ptrBuf.blockId !== undefined) {
             return `${ptrBuf.blockId}_${ptrBuf.offset || 0}`;
        }
        
        // Fast buffer read without full SmartPointer.decode overhead if standard format
        // Mode is top 2 bits of byte 0.
        // BlockId at offset 1 (6 bytes).
        // Offset at offset 11 (4 bytes).
        if (Buffer.isBuffer(ptrBuf)) {
             // Just use decode for safety and unification
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

    hydrateEdge(edge, dir) {
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
        } else if (idMaybe && !idMaybe.startsWith('INLINE')) {
             const parts = idMaybe.split('_');
             if(parts.length === 2) {
                 const bid = parseInt(parts[0]);
                 const off = parseInt(parts[1]);
                 if(!isNaN(bid)) buf = SmartPointer.block(type, bid, 0, false, off);
             }
        }

        if (!buf) return ptrMaybe; 
        return HandleRegistry.createHandle(this.db, buf, type, null);
    }
}

module.exports = GraphUtils;