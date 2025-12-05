// B"H
const constants = require('../../../constants.js');
const serializer = require('../../../utils/serializer.js');
const { readPointer48 } = require('../../../utils/binaryHelpers.js');

const HEADER_SIZE = constants.HEADER_SIZE || 64;

class BTreeReader {
    constructor(btree) {
        this.btree = btree;
        this.allocator = btree.allocator;
        this.GUARD_BYTE = constants.GUARD_BYTE || 0xFF;
        this.MAGIC = "BNOD"; // B"H: Expected Signature
    }

    log(msg) {
        if (this.allocator && this.allocator.db && this.allocator.db.debug) {
            console.log(`[B"H BTreeReader] ${msg}`);
        }
    }

    async getRoot() {
        if (!this.btree.rootPtr) {
            this.log("RootPtr is null. Initializing new Leaf Root.");
            const node = { isLeaf: true, keys: [], values: [], children: [], count: 0 };
            this.btree.rootPtr = await this.btree.io.saveNode(node);
            return node; 
        }
        
        try {
            return await this.loadNode(this.btree.rootPtr);
        } catch (e) {
            // B"H: Auto-Recovery for Corrupted Root
            const msg = e.message.toLowerCase();
            if (msg.includes("corrupt") || msg.includes("truncat") || msg.includes("buffer") || msg.includes("zeroed") || msg.includes("signature")) {
                 console.error(`B"H: CRITICAL - Root Tree Corrupted at ${this.btree.rootPtr.blockId}:${this.btree.rootPtr.offset}. Resetting Root.`);
                 console.error(`Original Error: ${e.message}`);
                 
                 const node = { isLeaf: true, keys: [], values: [], children: [], count: 0 };
                 this.btree.rootPtr = await this.btree.io.saveNode(node);
                 return node;
            }
            throw e;
        }
    }

    async loadNode(ptr) {
        if (!ptr || ptr.length === 0) {
            throw new Error("BTree: Attempted to load null pointer");
        }

        this.log(`Loading Node @ ${ptr.blockId}:${ptr.offset} (Len: ${ptr.length})`);

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

            this.log(`..Reading Chain of ${blocksToRead} blocks starting at ${ptr.blockId}`);
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
                this.log(`CRITICAL: Failed to load node at Block ${ptr.blockId}`);
                throw new Error(`BTree Load Failed: Block ${ptr.blockId}`);
            }
	        buffer = block.subarray(ptr.offset, ptr.offset + ptr.length);
	    }
        
        if (buffer.length === 0) {
            throw new Error(`BTree: Loaded 0-length buffer for Ptr Block ${ptr.blockId} Off ${ptr.offset}`);
        }
        
        // B"H: Early Corruption Detection
        if (buffer[0] === 0 && buffer[1] === 0 && buffer[2] === 0 && buffer[3] === 0) {
             const msg = `BTree: Node corrupted (Zeroed) at Block ${ptr.blockId} Offset ${ptr.offset}. Length: ${ptr.length}. This usually means a dangling pointer to a freed block.`;
             throw new Error(msg);
        }
	
	    let offset = 0;
        
        try {
            // B"H: Verify Signature "BNOD"
            if (offset + 4 > buffer.length) throw new Error("BTree: Buffer too short for Signature");
            const sig = buffer.toString('utf8', offset, offset + 4);
            offset += 4;
            
            if (sig !== this.MAGIC) {
                // If it's a legacy node (from before this fix), it won't have BNOD.
                // But for a new DB stress test, this indicates we are reading a wrong block (e.g. Handle or Meta).
                throw new Error(`BTree Corruption: Invalid Signature "${sig}" at ${ptr.blockId}:${ptr.offset}. Expected "BNOD". This implies a Pointer Mismatch.`);
            }

            if (offset >= buffer.length) throw new Error("BTree: Buffer too short for Flags");
            const flags = buffer.readUInt8(offset); offset++;
            const isLeaf = (flags & 1) === 1;
        
            if (offset + 2 > buffer.length) throw new Error("BTree: Buffer too short for KeyCount");
            const keyCount = buffer.readUInt16BE(offset); offset += 2;
        
            // B"H: Sanity Check for Corruption
            if (keyCount > 0 && keyCount * 2 > buffer.length) {
                 // Heuristic: Each key needs at least 1 byte + overhead.
                throw new Error(`BTree Corruption: KeyCount ${keyCount} unlikely for Node Length ${buffer.length}. Block ${ptr.blockId} was likely overwritten.`);
            }

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
                this.log("Warn: BTree Node Buffer missing Count/Guard");
            } else {
                const count = buffer.readUInt32BE(offset);
                offset += 4;
                
                if (offset < buffer.length) {
                    const guard = buffer.readUInt8(offset);
                    if (guard !== this.GUARD_BYTE) {
                         if (guard === 0) {
                            const msg = `BTree: Guard Byte Missing (Zeroed) at end of Node. Block ${ptr.blockId}`;
                            throw new Error(msg);
                        }
                        else this.log(`Warn: Guard Byte mismatch. Expected ${this.GUARD_BYTE}, got ${guard}`);
                    }
                }
                return { isLeaf, keys, values, children, count, ptr };
            }
            return { isLeaf, keys, values, children, count: 0, ptr };

        } catch (e) {
            console.error(`[BTreeReader] Load Failed for ${ptr.blockId}:${ptr.offset} (Len ${ptr.length}). HEX Dump:`);
            console.error(buffer.toString('hex'));
            throw e;
        }
	}
}

module.exports = BTreeReader;