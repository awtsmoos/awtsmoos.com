
// B"H
/**
 * @file utils.js
 * @description 
 * Chapter 9: The Identification of Souls
 * The GraphUtils decipher the True Names (IDs) of entities. Every SmartPointer 
 * is a unique coordinate in existence. By parsing these pointers, we assign 
 * identities to the graph nodes, allowing them to anchor to physical reality.
 */

const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');
const { readPointer48 } = require('../../utils/binaryHelpers.js');
const HandleRegistry = require('../../core/registry/handle.js');

/**
 * @class GraphUtils
 * @description Provides synchronous ID generation and hydration for the graph network.
 */
class GraphUtils {
    /**
     * @constructor
     * @param {object} manager - The parent manager.
     */
    constructor(manager) {
        this.manager = manager;
        this.db = manager.db;
    }

    /**
     * @method getId
     * @description Extracts the string ID from a LiveHandle.
     * @param {object|string} handle - The vessel to identify.
     * @returns {string|null} The absolute coordinate string.
     */
    getId(handle) {
        if (!handle) return null;
        if (typeof handle === 'string') return handle;

        let h = HandleRegistry.getSoul(handle);
        if (!h && handle[constants.SYMBOLS.INTERNALS]) {
            h = handle[constants.SYMBOLS.INTERNALS];
        }
        
        if (h) {
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

    /**
     * @method getIdFromPtr
     * @description Cracks open a 16-byte seal to read its inner block ID and offset.
     * @param {Buffer|object} ptrBuf - The SmartPointer.
     * @returns {string|null} The formatted ID.
     */
    getIdFromPtr(ptrBuf) {
        if (!ptrBuf) return null;
        if (ptrBuf.isStructure && ptrBuf.blockId !== undefined) {
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

    /**
     * @method hydrateEdge
     * @description Reconstitutes an edge relationship into a fully interactive object.
     */
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

    /**
     * @method hydrateNodeHandle
     * @description Constructs a LiveHandle from raw pointer parameters.
     */
    hydrateNodeHandle(ptrMaybe, typeMaybe, idMaybe) {
        if (HandleRegistry.isHandle(ptrMaybe)) return ptrMaybe;
        
        let finalPtrBuffer = null;
        let finalType = typeMaybe || constants.TYPE_DICTIONARY;

        if (Buffer.isBuffer(ptrMaybe) && ptrMaybe.length === 16) {
            finalPtrBuffer = ptrMaybe;
        } else if (ptrMaybe && ptrMaybe.isStructure) {
            finalPtrBuffer = ptrMaybe.ptr || SmartPointer.toBuffer(ptrMaybe);
        } else if (idMaybe && !idMaybe.startsWith('INLINE')) {
            const parts = idMaybe.split('_');
             if(parts.length === 2) {
                 const bid = parseInt(parts[0]);
                 const off = parseInt(parts[1]);
                 if(!isNaN(bid)) finalPtrBuffer = SmartPointer.block(finalType, bid, 0, false, off);
             }
        }

        if (!finalPtrBuffer || !Buffer.isBuffer(finalPtrBuffer) || finalPtrBuffer.length !== 16) {
            return ptrMaybe; 
        }

        const decoded = SmartPointer.decode(finalPtrBuffer);
        if (decoded) {
            finalType = decoded.type;
        }
        
        return HandleRegistry.createHandle(this.db, finalPtrBuffer, finalType, null);
    }
}

module.exports = GraphUtils;
