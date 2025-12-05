// B"H
const constants = require('../../../constants.js');
const serializer = require('../../../utils/serializer.js');
const { writePointer48 } = require('../../../utils/binaryHelpers.js');

const HEADER_SIZE = constants.HEADER_SIZE || 64;
const VAL_POINTER = 1; 
const VAL_INLINE = 2; // B"H: Stage 2 - New Type for Inline Data

class BTreeWriter {
    constructor(btree) {
        this.btree = btree;
        this.allocator = btree.allocator;
        this.GUARD_BYTE = constants.GUARD_BYTE || 0xFF;
        this.MAGIC = Buffer.from("BNOD"); // B"H: B-Tree Node Signature
    }

    log(msg) {
        if (this.allocator && this.allocator.db && this.allocator.db.debug) {
            console.log(`[B"H BTreeWriter] ${msg}`);
        }
    }

    async saveNode(node) {
        // Invariants
        if (!node.isLeaf && node.children.length !== node.keys.length + 1) {
            throw new Error(`BTree Save Invariant: Internal Node keys/children mismatch.`);
        }
        if (node.isLeaf && node.values.length !== node.keys.length) {
            throw new Error(`BTree Save Invariant: Leaf Node keys/values mismatch.`);
        }

        // Sort check
        for (let i = 1; i < node.keys.length; i++) {
            if (node.keys[i] < node.keys[i-1]) throw new Error(`BTree Save Error: Keys unsorted.`);
        }

	    const parts = [];
        // B"H: Add Magic Signature
        parts.push(this.MAGIC);

	    parts.push(Buffer.from([node.isLeaf ? 1 : 0]));
	    
	    const countBuf = Buffer.alloc(2);
	    countBuf.writeUInt16BE(node.keys.length);
	    parts.push(countBuf);
	
	    for (let k of node.keys) parts.push(serializer.writeString(k));
	
	    const writePtr = (p) => {
            if (!p || p.blockId === 0) throw new Error("BTree Save Error: Invalid pointer");
	        const bBuf = Buffer.alloc(6);
	        writePointer48(bBuf, p.blockId, 0);
	        parts.push(bBuf);
	        parts.push(serializer.writeVarInt(p.offset));
	        parts.push(serializer.writeVarInt(p.length));
	        parts.push(Buffer.from([p.isChain ? 1 : 0]));
	    };
	
	    if (node.isLeaf) {
	        for (let v of node.values) {
                // B"H: Stage 2 - Check for Inline Data
                if (v && (Buffer.isBuffer(v) || v.isInline)) {
                    const buf = v.isInline ? v.data : v;
                    parts.push(Buffer.from([VAL_INLINE]));
                    parts.push(serializer.writeVarInt(buf.length));
                    parts.push(buf);
                } else {
                    // Standard Pointer
                    parts.push(Buffer.from([VAL_POINTER])); 
                    writePtr(v);
                }
            }
	    } else {
            // Internal nodes remain pure pointers for structural efficiency
	        for (let c of node.children) writePtr(c);
	    }
	
	    const totalCountBuf = Buffer.alloc(4);
	    totalCountBuf.writeUInt32BE(node.count || 0);
	    parts.push(totalCountBuf);
        parts.push(Buffer.from([this.GUARD_BYTE]));
	
	    const raw = Buffer.concat(parts);
        
        let attempts = 0;
        let lastError = null;
        
        while (attempts < 3) {
            attempts++;
            try {
                // B"H LOG: Trace allocation
                this.log(`Requesting allocation of ${raw.length} bytes...`);
                const newPtr = await this.allocator.allocate(raw.length);
                this.log(`Allocated Node at ${newPtr.blockId}:${newPtr.offset} (Req Len: ${raw.length}, Alloc Len: ${newPtr.length})`);
            
                if (newPtr.isChain) {
                    let remaining = raw;
                    let currentBlock = newPtr.blockId;
                    
                    while(remaining.length > 0) {
                        let blk = await this.allocator.readBlockLocked(currentBlock);
                        if (!blk) blk = Buffer.alloc(constants.BLOCK_SIZE);

                        const start = (currentBlock === newPtr.blockId) ? newPtr.offset : HEADER_SIZE;
                        const avail = constants.BLOCK_SIZE - start;
                        const chunk = Math.min(remaining.length, avail);
                        
                        remaining.subarray(0, chunk).copy(blk, start);
                        await this.allocator.writeBlockLocked(currentBlock, blk);
                        
                        remaining = remaining.subarray(chunk);
                        currentBlock++;
                    }
                } else {
                    await this.allocator.writeUserSpace(newPtr, raw);
                }
                
                return newPtr;
            } catch (e) {
                this.log(`Save Node Attempt ${attempts} failed: ${e.message}`);
                lastError = e;
            }
        }
        throw new Error(`BTree Save Failed. Last Error: ${lastError ? lastError.message : 'Unknown'}`);
	}
}

module.exports = BTreeWriter;