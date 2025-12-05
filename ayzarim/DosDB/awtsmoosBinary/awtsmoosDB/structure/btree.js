// B"H
// structure/btree.js
const constants = require('../constants.js');
const serializer = require('../utils/serializer.js');
const {
	writePointer48, 
	readPointer48 
} = require('../utils/binaryHelpers.js');

class BTree {
    constructor(allocator, rootPtr = null) {
        this.allocator = allocator;
        this.rootPtr = rootPtr;
        // Low order to force splits and exercise logic freqently
        this.order = 10; 
        this.NODE_MAGIC = constants.MAGIC_BTREE_NODE || 0x42;
        this.GUARD_BYTE = constants.GUARD_BYTE || 0xFF;
    }

    log(msg) {
        if (this.allocator && this.allocator.db && this.allocator.db.debug) {
            console.log(`[BTree] ${msg}`);
        }
    }

    async getRoot() {
        if (!this.rootPtr) {
            // Create empty root (Leaf)
            const node = { isLeaf: true, keys: [], values: [], children: [], count: 0 };
            this.rootPtr = await this.saveNode(node);
        }
        return await this.loadNode(this.rootPtr);
    }

    async loadNode(ptr) {
        if (!ptr || ptr.length === 0) {
            throw new Error("BTree: Attempted to load null pointer");
        }

	    let buffer;
	    if (ptr.isChain) {
	        const endBlockId = Math.floor(((ptr.blockId * constants.BLOCK_SIZE) + ptr.offset + ptr.length - 1) / constants.BLOCK_SIZE);
	        const blocksToRead = (endBlockId - ptr.blockId) + 1;
	
	        const rawChain = await this.allocator.pager.readSequential(ptr.blockId, blocksToRead);
	        buffer = Buffer.alloc(ptr.length);
	        
	        let bufOffset = 0;
	        let rem = ptr.length;
	        
	        for (let i = 0; i < blocksToRead; i++) {
	            const blockView = rawChain.subarray(i * constants.BLOCK_SIZE, (i + 1) * constants.BLOCK_SIZE);
	            const start = (i === 0) ? ptr.offset : constants.UNIT_SIZE;
	            const avail = constants.BLOCK_SIZE - start;
	            const copy = Math.min(rem, avail);
	            
	            blockView.copy(buffer, bufOffset, start, start + copy);
	            bufOffset += copy;
	            rem -= copy;
	        }
	    } else {
	        const block = await this.allocator.readBlockLocked(ptr.blockId);
            if (!block) {
                this.log(`Critical: Failed to load node at Block ${ptr.blockId}`);
                throw new Error(`BTree Load Failed: Block ${ptr.blockId}`);
            }
	        buffer = block.subarray(ptr.offset, ptr.offset + ptr.length);
	    }
        
        if (buffer.length === 0) {
            throw new Error(`BTree: Loaded 0-length buffer for Ptr Block ${ptr.blockId} Off ${ptr.offset}`);
        }
	
	    let offset = 0;
	    
        // Safety check for OOB
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
            
            // Validation: Ensure sorted
            if (i > 0 && keys[i] < keys[i-1]) {
                throw new Error(`BTree Corruption: Node keys unsorted on load. ${keys[i-1]} > ${keys[i]}`);
            }
	    }
	
	    const readPtr = () => {
            // Strict bound check: We need at least 6 bytes for blockID + 2 bytes min for varints + 1 byte chain = 9 bytes
            if (offset + 6 > buffer.length) {
                return null;
            }
	        const blockId = readPointer48(buffer, offset); offset += 6;
	        const o = serializer.readVarInt(buffer, offset); offset += o.bytesRead;
	        const l = serializer.readVarInt(buffer, offset); offset += l.bytesRead;
            
            if (offset >= buffer.length) return null;
	        const c = buffer.readUInt8(offset); offset++;
            
            if (blockId === 0) return null; // Treat blockId 0 as null/corruption

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
                if (!child) throw new Error(`BTree: Buffer truncation or Corruption reading Children. Expected ${keyCount+1}, got ${i}. Block ${ptr.blockId}, Offset ${ptr.offset}`);
	            children.push(child);
	        }
	    }
	
        if (offset + 4 > buffer.length) {
             this.log("Warn: BTree Node Buffer missing Count/Guard");
        } else {
            const count = buffer.readUInt32BE(offset);
            offset += 4;
            return { isLeaf, keys, values, children, count, ptr };
        }
        
        return { isLeaf, keys, values, children, count: 0, ptr };
	}

    async saveNode(node) {
        // Invariant Check
        if (!node.isLeaf) {
            if (node.children.length !== node.keys.length + 1) {
                throw new Error(`BTree Save Invariant Violation: Internal Node has ${node.keys.length} keys but ${node.children.length} children. Expected ${node.keys.length + 1}.`);
            }
        } else {
             if (node.values.length !== node.keys.length) {
                throw new Error(`BTree Save Invariant Violation: Leaf Node has ${node.keys.length} keys but ${node.values.length} values.`);
            }
        }

        // Validation: Ensure sorted
        for (let i = 1; i < node.keys.length; i++) {
            if (node.keys[i] < node.keys[i-1]) {
                throw new Error(`BTree Save Error: Keys unsorted before save. ${node.keys[i-1]} > ${node.keys[i]}`);
            }
        }

	    const parts = [];
	    
	    parts.push(Buffer.from([node.isLeaf ? 1 : 0]));
	    
	    const countBuf = Buffer.alloc(2);
	    countBuf.writeUInt16BE(node.keys.length);
	    parts.push(countBuf);
	
	    for (let k of node.keys) {
	        parts.push(serializer.writeString(k));
	    }
	
	    const writePtr = (p) => {
            if (!p || p.blockId === 0) throw new Error("BTree Save Error: Attempting to write null/invalid pointer");
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
        
        // Free old pointer before allocating new one to allow reuse
        if (node.ptr) {
            await this.allocator.free(node.ptr);
        }
        
        // Retry Loop: Attempt to allocate and write up to 3 times to prevent transient corruption
        let attempts = 0;
        let lastError = null;
        
        while (attempts < 3) {
            attempts++;
            try {
                const newPtr = await this.allocator.allocate(raw.length);
            
                if (newPtr.isChain) {
                    await this.allocator.db._writeChainSafe(newPtr, raw);
                } else {
                    await this.allocator.writeUserSpace(newPtr, raw);
                }
                
                // CRITICAL: Verify the write immediately
                // This ensures we never return a pointer to a zeroed block
                await this.loadNode(newPtr);
                
                return newPtr;
            } catch (e) {
                this.log(`Save Node Attempt ${attempts} failed: ${e.message}. Retrying...`);
                lastError = e;
                // If it was a verification failure, the block is corrupt or not written.
                // We just loop to allocate a NEW block (likely different location) and try again.
            }
        }
        
        throw new Error(`BTree Save Failed after 3 attempts. Last Error: ${lastError ? lastError.message : 'Unknown'}`);
	}

    async insert(key, valuePtr) {
        const root = await this.getRoot();
        const result = await this.insertRecursive(root, key, valuePtr);
        
        if (result.newPtr) {
            this.rootPtr = result.newPtr;
        }

        if (result.newChild) {
            this.log(`Root Split. New Root created.`);
            const newRoot = {
                isLeaf: false,
                keys: [result.newChild.key],
                children: [this.rootPtr, result.newChild.ptr], 
                values: [],
                count: (root.count || 0) + (await this.getSubtreeCount(result.newChild.ptr))
            };
            this.rootPtr = await this.saveNode(newRoot);
        }
    }

    async insertRecursive(node, key, valuePtr) {
	    // Case 1: Leaf Node
	    if (node.isLeaf) {
	            let idx = 0;
	            while (idx < node.keys.length && key > node.keys[idx]) idx++;
	            
                if (idx < node.keys.length && node.keys[idx] === key) {
                    node.values[idx] = valuePtr;
                    const savedPtr = await this.saveNode(node);
                    return { newChild: null, newPtr: savedPtr };
                }

	            node.keys.splice(idx, 0, key);
	            node.values.splice(idx, 0, valuePtr);
	            node.count = (node.count || 0) + 1;
	            
	            if (node.keys.length > this.order) {
	                return await this.splitLeaf(node);
	            }
	
	            const savedPtr = await this.saveNode(node);
	            return { newChild: null, newPtr: savedPtr };
	        } 
	    
	    // Case 2: Internal Node
	    let idx = 0;
        // Navigation: Keys >= Separator go Right
	    while (idx < node.keys.length && key >= node.keys[idx]) idx++;
	    
        if (idx >= node.children.length) {
             throw new Error(`BTree Integrity Error: Index ${idx} out of bounds for children length ${node.children.length}`);
        }

	    const childPtr = node.children[idx];
	    const childNode = await this.loadNode(childPtr);
	    
	    const result = await this.insertRecursive(childNode, key, valuePtr);
	    
        // Update pointer if child moved
        if (result.newPtr) {
            node.children[idx] = result.newPtr;
        }

	    if (result.newChild) {
	        node.keys.splice(idx, 0, result.newChild.key);
	        node.children.splice(idx + 1, 0, result.newChild.ptr);
            
            node.count = await this.sumChildren(node.children);
	
	        if (node.children.length > this.order + 1) {
	            return await this.splitInternal(node);
	        } else {
	            const savedPtr = await this.saveNode(node);
	            return { newChild: null, newPtr: savedPtr };
	        }
	    } else {
	        node.count = await this.sumChildren(node.children);
	        const savedPtr = await this.saveNode(node);
	        return { newChild: null, newPtr: savedPtr };
	    }
	}

    async splitLeaf(node) {
        const mid = Math.floor(node.keys.length / 2);
        
        const siblingKeys = node.keys.splice(mid);
        const siblingValues = node.values.splice(mid);

        const sibling = {
            isLeaf: true,
            keys: siblingKeys,
            values: siblingValues,
            children: [],
            count: siblingKeys.length
        };
        node.count = node.keys.length;

        const sibPtr = await this.saveNode(sibling);
        const nodePtr = await this.saveNode(node); 
        node.ptr = nodePtr;

        return { newChild: { key: sibling.keys[0], ptr: sibPtr }, newPtr: nodePtr };
    }

    async splitInternal(node) {
        const mid = Math.floor(node.keys.length / 2);
        const upKey = node.keys[mid];
        
        const siblingKeys = node.keys.splice(mid + 1);
        node.keys.pop(); // Remove upKey

        const siblingChildren = node.children.splice(mid + 1);

        const sibling = {
            isLeaf: false,
            keys: siblingKeys,
            children: siblingChildren,
            values: [],
            count: 0
        };
        
        sibling.count = await this.sumChildren(sibling.children);
        node.count = await this.sumChildren(node.children);

        const sibPtr = await this.saveNode(sibling);
        const nodePtr = await this.saveNode(node);
        node.ptr = nodePtr;

        return { newChild: { key: upKey, ptr: sibPtr }, newPtr: nodePtr };
    }

    async sumChildren(childPtrs) {
        let sum = 0;
        for(let p of childPtrs) {
            if(!p) continue;
            sum += await this.getSubtreeCount(p);
        }
        return sum;
    }

    async getSubtreeCount(ptr) {
        const node = await this.loadNode(ptr);
        return node.count;
    }
    
    async search(key) {
        const root = await this.getRoot();
        return await this.searchRecursive(root, key);
    }

    async searchRecursive(node, key) {
        if (node.isLeaf) {
            const idx = node.keys.indexOf(key);
            if (idx !== -1) {
                return node.values[idx];
            }
            return null;
        }

        let idx = 0;
        while (idx < node.keys.length && key >= node.keys[idx]) idx++;
        
        const childPtr = node.children[idx];
        const childNode = await this.loadNode(childPtr);
        
        return await this.searchRecursive(childNode, key);
    }
    
    async getRange(startRank, limit) {
	    const root = await this.getRoot();
	    const results = [];
	    await this.collectRange(root, startRank, limit, results, 0);
	    return results;
	}
	
	async collectRange(node, startRank, limit, results, currentOffset) {
	    if (results.length >= limit) return; 
	
	    if (node.isLeaf) {
            let localIdx = 0;
            if (startRank > currentOffset) {
                localIdx = startRank - currentOffset;
            }
            if (localIdx < 0) localIdx = 0;

            while (localIdx < node.keys.length && results.length < limit) {
                results.push({
                    key: node.keys[localIdx],
                    ptr: node.values[localIdx]
                });
                localIdx++;
            }
	        return;
	    }
	
	    let accumulator = currentOffset;
	    for (let i = 0; i < node.children.length; i++) {
            if (results.length >= limit) return;
            
	        const childPtr = node.children[i];
	        const childNode = await this.loadNode(childPtr);
	        const childCount = childNode.count;
            const childEnd = accumulator + childCount;
	        
            if (startRank === 0 || childEnd > startRank) {
                await this.collectRange(childNode, startRank, limit, results, accumulator);
            }
	        
	        accumulator += childCount;
	    }
	}
    
    async remove(key) {
	    const root = await this.getRoot();
	    const result = await this.removeRecursive(root, key);
	    
	    if (result.modified) {
            this.rootPtr = result.newPtr;
	    }
	}
	
	async removeRecursive(node, key) {
	    if (node.isLeaf) {
	        const idx = node.keys.indexOf(key);
	        if (idx !== -1) {
	            node.keys.splice(idx, 1);
	            node.values.splice(idx, 1);
	            node.count--;
	            
	            const savedPtr = await this.saveNode(node);
	            return { modified: true, newPtr: savedPtr, countDelta: -1 };
	        }
	        return { modified: false, countDelta: 0 };
	    }
	
	    let idx = 0;
	    while (idx < node.keys.length && key >= node.keys[idx]) idx++;
	    
	    const childPtr = node.children[idx];
	    const childNode = await this.loadNode(childPtr);
	    
	    const result = await this.removeRecursive(childNode, key);
	    
	    if (result.modified) {
	        node.children[idx] = result.newPtr;
	        node.count += result.countDelta;
	        
	        const savedPtr = await this.saveNode(node);
	        return { modified: true, newPtr: savedPtr, countDelta: result.countDelta };
	    }
	    
	    return { modified: false, countDelta: 0 };
	}
}

module.exports = BTree;