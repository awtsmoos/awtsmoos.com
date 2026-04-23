
// B"H
/**
 * @file seeker.js
 * @description
 *  =============================================================================
 *  CHAPTER 4: THE REVELATION OF HIDDEN LIGHT (QUERY & SEARCH)
 *  =============================================================================
 *  "The hidden things belong to the Lord our G-d..."
 *  Extracts lengths and precise pointer offsets from the densely packed array.
 */

class Seeker {
    constructor(flatObject) {
        this.flat = flatObject;
    }

    length() {
        if (this.flat.isShattered) return this.flat.engine.seq.length();
        
        // Fast path: if pointer invalid, return 0
        if (!this.flat.ptr || !this.flat.ptr.blockId) return 0;
        
        // Safe read
        const buf = this.flat.allocator.db._readChainSafe(this.flat.ptr);
        if (!buf) return 0;
        return buf.readUInt16BE(4);
    }

    get(key) {
        if (this.flat.isShattered) return this.flat.engine.getPtr(key);
        
        if (!this.flat.ptr || !this.flat.ptr.blockId) return undefined;
        const buf = this.flat.allocator.db._readChainSafe(this.flat.ptr);
        if (!buf) return undefined;
        
        const count = buf.readUInt16BE(4);
        const keyBuf = Buffer.from(key, 'utf8');
        
        let cursor = 6;
        for(let i = 0; i < count; i++) {
            if (cursor >= buf.length) break;
            const kLen = buf.readUInt8(cursor);
            
            if (kLen === keyBuf.length) {
                const kBytes = buf.subarray(cursor + 1, cursor + 1 + kLen);
                if (kBytes.compare(keyBuf) === 0) {
                    return buf.subarray(cursor + 1 + kLen, cursor + 1 + kLen + 16);
                }
            }
            cursor += 1 + kLen + 16;
        }
        return undefined;
    }
}

module.exports = Seeker;
