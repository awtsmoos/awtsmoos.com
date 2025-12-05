// B"H
const constants = require('../../constants.js');
const serializer = require('../../utils/serializer.js');
const { writePointer48, readPointer48 } = require('../../utils/binaryHelpers.js');

const HEADER_SIZE = constants.HEADER_SIZE || 64;

class NodeIO {
    constructor(btree) {
        this.btree = btree;
        this.allocator = btree.allocator;
        this.GUARD_BYTE = constants.GUARD_BYTE || 0xFF;
    }

    async getRoot() {
        if (!this.btree.rootPtr) {
            // Create empty root (Leaf)
            const node = { isLeaf: true, keys: [], values: [], children: [], count: 0 };
            this.btree.rootPtr = await this.saveNode(node);
        }
        return await this.loadNode(this.btree.rootPtr);
    }

    async loadNode(ptr) {
        if (!ptr || ptr.length === 0) {
            throw new Error("BTree: Attempted to load null pointer");
        }

	    let buffer;
	    if (ptr.isChain) {
            const firstBlockCap = constants.BLOCK_SIZE - ptr.offset;
            const subsequentBlockCap = constants.BLOCK_SIZE - HEADER_SIZE;
            
            let remainingLen = ptr.length;
            let blocksToRead = 1;
            
            if (remainingLen > firstBlockCap) {
                remainingLen -= firstBlockCap;
                blocksToRead += Math.ceil(remainingLen / subsequentBlockCap);
            }

	        const rawChain = await this.allocator.pager.readSequentialLocked(ptr.blockId, blocksToRead);
	        buffer = Buffer.alloc(ptr.length);
	        
	        let bufOffset = 0;
	        let rem = ptr.length;
	        
	        for (let i = 0; i < blocksToRead; i++) {
	            const blockView = rawChain.subarray(i * constants.BLOCK_SIZE, (i + 1) * constants.BLOCK_SIZE);
	            const start = (i === 0) ? ptr.offset : HEADER_SIZE;
	            const avail = constants.BLOCK_SIZE - start;
	            const copy = Math.min(rem, avail);
	            
	            blockView.copy(buffer, bufOffset, start, start + copy);
	            bufOffset += copy;
	            rem -= copy;
	        }
	    } else {
	        const block = await this.allocator.readBlockLocked(ptr.blockId);
            if (!block) {
                this.btree.log(`Critical: Failed to load node at Block ${ptr.blockId}`);
                throw new Error(`BTree Load Failed: Block ${ptr.blockId}`);
            }
	        buffer = block.subarray(ptr.offset, ptr.offset + ptr.length);
	    }
        
        if (buffer.length === 0) {
            throw new Error(`BTree: Loaded 0-length buffer for Ptr Block ${ptr.blockId} Off ${ptr.offset}`);
        }
        
        // B"H: Early Corruption Detection
        // If the first few bytes are 0, it means the node was zeroed out (freed/reallocated)
        // or never written.
        if (buffer[0] === 0 && buffer[1] === 0 && buffer[2] === 0) {
             throw new Error(`BTree: Node corrupted (Zeroed) at Block ${ptr.blockId} Offset ${ptr.offset}. Length: ${ptr.length}. This usually means a dangling pointer to a freed block.`);
        }
	
	    let offset = 0;
	    
        if (offset >= buffer.length) throw new Error("BTree: Buffer too short for Flags");
	    const flags = buffer.readUInt8(offset); offset++;
	    const isLeaf = (flags & 1) === 1;
	
        if (offset + 2 > buffer.length) throw new Error("BTree: Buffer too short for KeyCount");
	    const keyCount = buffer.readUInt16BE(offset); offset += 2;
	
	    const keys = [];
	    for (let i = 0; i < keyCount; i++) {
            if (offset >= buffer.length) throw new Error("BTree: Buffer truncation reading Keys");
	        const k = serializer.readString(buffer, offset);
	        keys.push(k.value);
	        offset += k.bytesRead;
            
            if (i > 0 && keys[i] < keys[i-1]) {
                throw new Error(`BTree Corruption: Node keys unsorted on load. ${keys[i-1]} > ${keys[i]}`);
            }
	    }
	
	    const readPtr = () => {
            if (offset + 6 > buffer.length) return null;
	        const blockId = readPointer48(buffer, offset); offset += 6;
	        const o = serializer.readVarInt(buffer, offset); offset += o.bytesRead;
	        const l = serializer.readVarInt(buffer, offset); offset += l.bytesRead;
            
            if (offset >= buffer.length) return null;
	        const c = buffer.readUInt8(offset); offset++;
            
            if (blockId === 0) return null; 

	        return { blockId: blockId, offset: o.value, length: l.value, isChain: c === 1 };
	    };
	
	    const values = [];
	    const children = [];
	
	    if (isLeaf) {
	        for (let i = 0; i < keyCount; i++) {
                const val = readPtr();
                if (!val) throw new Error("BTree: Buffer truncation or Corruption reading Values");
	            values.push(val);
	        }
	    } else {
	        for (let i = 0; i <= keyCount; i++) {
                const child = readPtr();
                if (!child) throw new Error(`BTree: Buffer truncation or Corruption reading Children. Expected ${keyCount+1}, got ${i}. Block ${ptr.blockId}`);
	            children.push(child);
	        }
	    }
	
        if (offset + 4 > buffer.length) {
             this.btree.log("Warn: BTree Node Buffer missing Count/Guard");
        } else {
            const count = buffer.readUInt32BE(offset);
            offset += 4;
            
            // B"H: Guard Byte Check
            if (offset < buffer.length) {
                const guard = buffer.readUInt8(offset);
                if (guard !== this.GUARD_BYTE) {
                     if (guard === 0) throw new Error(`BTree: Guard Byte Missing (Zeroed) at end of Node. Block ${ptr.blockId}`);
                     else this.btree.log(`Warn: Guard Byte mismatch. Expected ${this.GUARD_BYTE}, got ${guard}`);
                }
            }

            return { isLeaf, keys, values, children, count, ptr };
        }
        
        return { isLeaf, keys, values, children, count: 0, ptr };
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
	        for (let v of node.values) writePtr(v);
	    } else {
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
                const newPtr = await this.allocator.allocate(raw.length);
            
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
                
                // Verify
                await this.loadNode(newPtr);
                return newPtr;
            } catch (e) {
                this.btree.log(`Save Node Attempt ${attempts} failed: ${e.message}`);
                lastError = e;
            }
        }
        throw new Error(`BTree Save Failed. Last Error: ${lastError ? lastError.message : 'Unknown'}`);
	}
}

module.exports = NodeIO;