
// B"H
/**
 * @file node.js (MapNode)
 * @description 
 *  =============================================================================
 *  CHAPTER 5: THE TREE OF KNOWLEDGE (EXACT-BYTE MAP NODES)
 *  =============================================================================
 *  "The words of Our G-d are eternal." 
 *  
 *  In the dark ages, the Map Node blindly assumed every pointer was exactly 16 bytes.
 *  This was a transgression against the VarInt, causing corrupted offsets and 
 *  wasted void. We have now brought total exact-byte awareness to the B-Tree. 
 *  Every key and every pointer declares its size, and the Node fits them together 
 *  like perfect, gapless stones in the wall of the Temple.
 */

const constants = require('../../constants.js');
const serializer = require('../../utils/serializer.js');
const SmartPointer = require('../../utils/smartPointer.js');

class MapNode {
    constructor(allocator, engine) { 
        this.allocator = allocator; 
        this.engine = engine;
        this.db = allocator.db || (allocator.v1 ? allocator.v1.db : null); 
    }

    /**
     * @method save
     * @description Calculates the absolute exact byte size of the node and serializes it.
     */
    save(node) {
        if (!node) return null;

        const keyCountVarIntSize = this._getVarIntSize(node.keys.length);
        // Magic(4) + isLeaf(1) + KeyCountVarInt + TotalCount(4) + TotalBytes(6)
        let size = 4 + 1 + keyCountVarIntSize + 4 + 6; 

        const ptrs = node.isLeaf ? node.values : node.children;

        // Calculate Exact Byte Need
        for (let i = 0; i < node.keys.length; i++) {
            const k = node.keys[i];
            size += this._getVarIntSize(k.length) + k.length;
            
            const p = SmartPointer.toBuffer(ptrs[i]);
            size += this._getVarIntSize(p.length) + p.length; 
        }
        
        // Internal nodes have one extra child pointer
        if (!node.isLeaf && ptrs.length > node.keys.length) {
            const p = SmartPointer.toBuffer(ptrs[ptrs.length - 1]);
            size += this._getVarIntSize(p.length) + p.length;
        }

        // B"H: The Exact Byte Allocator does not need padding.
        // We directly ask the unified allocator for space.
        const ptr = (this.allocator.v1 || this.allocator).allocate(size);

        const buf = Buffer.allocUnsafe(size).fill(0);
        let offset = 0;
        
        buf.write(constants.MAGIC_MAP_NODE, offset); offset += 4;
        buf.writeUInt8(node.isLeaf ? 1 : 0, offset++);
        
        offset += serializer.writeVarIntTo(buf, offset, node.keys.length);
        buf.writeUInt32BE(node.totalCount || 0, offset); offset += 4;
        
        // Write TotalBytes (48-bit)
        const high = Math.floor((node.totalBytes || 0) / 0x100000000);
        const low = (node.totalBytes || 0) % 0x100000000;
        buf.writeUInt16BE(high, offset);
        buf.writeUInt32BE(low, offset + 2);
        offset += 6;

        for (let i = 0; i < node.keys.length; i++) {
            const k = node.keys[i];
            offset += serializer.writeVarIntTo(buf, offset, k.length);
            k.copy(buf, offset); offset += k.length;
            
            const pSeal = SmartPointer.toBuffer(ptrs[i]);
            offset += serializer.writeVarIntTo(buf, offset, pSeal.length);
            pSeal.copy(buf, offset); offset += pSeal.length;
        }
        
        if (!node.isLeaf && ptrs.length > node.keys.length) {
            const pSeal = SmartPointer.toBuffer(ptrs[ptrs.length - 1]);
            offset += serializer.writeVarIntTo(buf, offset, pSeal.length);
            pSeal.copy(buf, offset); offset += pSeal.length;
        }

        this.db._writeChainSafe(ptr, buf);
        node.selfPtr = ptr;
        
        this.db.cacheStructure(ptr, node);
        return ptr;
    }

    /**
     * @method load
     * @description Rehydrates the tree node using dynamic VarInt decoding.
     */
    load(ptr) {
        if (!ptr || ptr.offset === undefined) return null;
        const cached = this.db.getCachedStructure(ptr);
        if (cached) return cached;
        
        const raw = this.db._readChainSafe(ptr);
        if (!raw || raw.length < 4) return null;

        const node = this._parse(raw, ptr);
        if (node) this.db.cacheStructure(ptr, node);
        return node;
    }

    _parse(raw, ptr) {
        const magic = raw.subarray(0, 4).toString();
        if (magic !== constants.MAGIC_MAP_NODE) return null; 

        const isLeaf = raw[4] === 1;
        const infoCount = serializer.readVarInt(raw, 5);
        let offset = 5 + infoCount.bytesRead;
        
        const totalCount = raw.readUInt32BE(offset); offset += 4;
        
        // Read TotalBytes (48-bit)
        const high = raw.readUInt16BE(offset);
        const low = raw.readUInt32BE(offset + 2);
        const totalBytes = (high * 0x100000000) + low;
        offset += 6;

        const keys = []; 
        const seals = [];
        
        for(let i=0; i<infoCount.value; i++) {
            // Read Key
            const infoLen = serializer.readVarInt(raw, offset); offset += infoLen.bytesRead;
            const k = Buffer.allocUnsafe(infoLen.value);
            raw.copy(k, 0, offset, offset + infoLen.value);
            keys.push(k); offset += infoLen.value;
            
            // Read VarInt Pointer
            const pLenInfo = serializer.readVarInt(raw, offset); offset += pLenInfo.bytesRead;
            const s = Buffer.allocUnsafe(pLenInfo.value); 
            raw.copy(s, 0, offset, offset + pLenInfo.value);
            seals.push(s); offset += pLenInfo.value;
        }
        
        if (!isLeaf) {
            const pLenInfo = serializer.readVarInt(raw, offset); offset += pLenInfo.bytesRead;
            const lastS = Buffer.allocUnsafe(pLenInfo.value); 
            raw.copy(lastS, 0, offset, offset + pLenInfo.value);
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
