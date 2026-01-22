// B"H
/**
 * @file node.js (MapNode)
 * @description 
 *  The Scribe of the B-Tree Node serialization.
 *  FIXED: Precise buffer allocation to prevent ERR_OUT_OF_RANGE.
 */

const constants = require('../../constants.js');
const serializer = require('../../utils/serializer.js');
const { writePointer48, readPointer48 } = require('../../utils/binaryHelpers.js');
const SmartPointer = require('../../utils/smartPointer.js');

class MapNode {
    constructor(allocator, engine) { 
        this.allocator = allocator; 
        this.engine = engine;
        this.db = allocator.db; 
    }

    /**
     * @method save
     * @description Persists a B-Tree node, correctly encoding child and value pointers.
     */
    save(node) {
        if (!node) return null;

        // B"H: Base Size Calculation
        // Magic(4) + isLeaf(1) + KeyCountVarInt(1-5) + totalCount(4) + totalBytes(6)
        // For 0 keys: 4 + 1 + 1 + 4 + 6 = 16 bytes.
        const keyCountVarIntSize = this._getVarIntSize(node.keys.length);
        let size = 4 + 1 + keyCountVarIntSize + 4 + 6; 

        // Add size for keys and pointers
        for (let i = 0; i < node.keys.length; i++) {
            const k = node.keys[i];
            size += this._getVarIntSize(k.length) + k.length + 16; // VarInt + Key + Pointer
        }
        if (!node.isLeaf) size += 16; // The final child pointer

        let ptr = node.selfPtr;
        // Reallocate if the vessel is too small
        if (!ptr || (ptr.length || 0) < size) {
            ptr = this.allocator.allocate(size);
        }

        const buf = Buffer.alloc(size).fill(0);
        let offset = 0;
        
        buf.write(constants.MAGIC_MAP_NODE, offset); offset += 4;
        buf.writeUInt8(node.isLeaf ? 1 : 0, offset++);
        
        offset += serializer.writeVarIntTo(buf, offset, node.keys.length);
        buf.writeUInt32BE(node.totalCount || 0, offset); offset += 4;
        writePointer48(buf, node.totalBytes || 0, offset); offset += 6;
        
        const ptrs = node.isLeaf ? node.values : node.children;
        const T = constants.VAL_TYPE;

        for (let i = 0; i < node.keys.length; i++) {
            const k = node.keys[i];
            offset += serializer.writeVarIntTo(buf, offset, k.length);
            k.copy(buf, offset); offset += k.length;
            
            let pSeal;
            if (!node.isLeaf) {
                const childPtr = ptrs[i];
                pSeal = Buffer.isBuffer(childPtr) ? childPtr : SmartPointer.block(T.MAP, childPtr.blockId, childPtr.length, !!childPtr.isChain, childPtr.offset);
            } else {
                pSeal = SmartPointer.toBuffer(ptrs[i]);
            }
            pSeal.copy(buf, offset); offset += 16;
        }
        
        if (!node.isLeaf && ptrs.length > node.keys.length) {
            const lastChild = ptrs[ptrs.length - 1];
            let lastSeal = Buffer.isBuffer(lastChild) ? lastChild : SmartPointer.block(T.MAP, lastChild.blockId, lastChild.length, !!lastChild.isChain, lastChild.offset);
            lastSeal.copy(buf, offset); offset += 16;
        }

        this.db._writeChainSafe(ptr, buf.subarray(0, offset));
        node.selfPtr = ptr;
        
        this.db.cacheStructure(ptr, node);
        return ptr;
    }

    /**
     * @method load
     * @description Awakens a node from its physical coordinate.
     */
    load(ptr) {
        if (!ptr || ptr.blockId === 0) return null;
        const cached = this.db.getCachedStructure(ptr);
        if (cached) return cached;
        
        const raw = this.db._readChainSafe(ptr);
        if (!raw || raw.length < 4) return null;

        const node = this._parse(raw, ptr);
        this.db.cacheStructure(ptr, node);
        return node;
    }

    _parse(raw, ptr) {
        const magic = raw.subarray(0, 4).toString();
        if (magic !== constants.MAGIC_MAP_NODE) return null; 

        const isLeaf = raw[4] === 1;
        const infoCount = serializer.readVarInt(raw, 5);
        let offset = 5 + infoCount.bytesRead;
        
        const totalCount = raw.readUInt32BE(offset); offset += 4;
        const totalBytes = readPointer48(raw, offset); offset += 6;

        const keys = []; 
        const seals = [];
        for(let i=0; i<infoCount.value; i++) {
            const infoLen = serializer.readVarInt(raw, offset); offset += infoLen.bytesRead;
            
            const k = Buffer.allocUnsafe(infoLen.value);
            raw.copy(k, 0, offset, offset + infoLen.value);
            keys.push(k); offset += infoLen.value;
            
            const s = Buffer.allocUnsafe(16); 
            raw.copy(s, 0, offset, offset + 16);
            seals.push(s); offset += 16;
        }
        
        if (!isLeaf) {
            const lastS = Buffer.allocUnsafe(16); 
            raw.copy(lastS, 0, offset, offset + 16);
            seals.push(lastS);
        }
        
        return { 
            selfPtr: ptr, 
            isLeaf, keys, 
            values: isLeaf ? seals : [], 
            children: isLeaf ? [] : seals, 
            totalCount, totalBytes 
        };
    }

    _getVarIntSize(v) {
        let s = 0; let cur = v;
        do { s++; cur >>>= 7; } while (cur > 0);
        return s;
    }
}
module.exports = MapNode;