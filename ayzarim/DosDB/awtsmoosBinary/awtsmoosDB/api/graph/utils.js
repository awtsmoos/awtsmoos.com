
// B"H
/**
 * @file utils.js
 * @description 
 *  Chapter 9: The Identification of Souls
 *  The GraphUtils decipher the True Names (IDs) of entities. Every SmartPointer 
 *  is a unique coordinate in existence. By parsing these pointers, we assign 
 *  identities to the graph nodes, allowing them to anchor to physical reality.
 */

const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');
const HandleRegistry = require('../../core/registry/handle.js');

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
            h.ensureResolved(); 
            if (h.ptr) {
                return this.getIdFromPtr(h.ptr);
            }
        }

        if (Buffer.isBuffer(handle) && handle.length > 0) {
            return this.getIdFromPtr(handle);
        }
        return null;
    }

    getIdFromPtr(ptrBuf) {
        if (!ptrBuf) return null;
        if (ptrBuf.isStructure && ptrBuf.offset !== undefined) {
             return `${ptrBuf.offset}`;
        }
        
        if (Buffer.isBuffer(ptrBuf)) {
             const decoded = SmartPointer.decode(ptrBuf);
             if (decoded) {
                 return `${decoded.offset}`;
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
        
        let finalPtrBuffer = null;
        let finalType = typeMaybe || constants.TYPE_DICTIONARY;

        if (Buffer.isBuffer(ptrMaybe) && ptrMaybe.length > 0) {
            finalPtrBuffer = ptrMaybe;
        } else if (ptrMaybe && ptrMaybe.isStructure) {
            finalPtrBuffer = ptrMaybe.ptr || SmartPointer.toBuffer(ptrMaybe);
        } else if (idMaybe) {
            const off = parseInt(idMaybe);
            if(!isNaN(off)) finalPtrBuffer = SmartPointer.encode(finalType, off, 0);
        }

        if (!finalPtrBuffer || !Buffer.isBuffer(finalPtrBuffer)) {
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
