// B"H
// structure/btree.js
const constants = require('../constants.js');
const serializer = require('../utils/serializer.js');
const serializeValue = require('../serialize/serializeValue.js');
const {
	writeConditional, 
	packedLength, 
	readPointer48, 
	writePointer48 
} = require('../utils/binaryHelpers.js');
/**
 * A B+ Tree implementation that stores Nodes as Objects via the Allocator.
 * Supports "Count Augmentation" for O(log N) pagination.
 */
class BTree {
    constructor(allocator, rootPtr = null) {
        this.allocator = allocator;
        this.rootPtr = rootPtr;
        // Optimization: 4096 bytes / ~50 bytes per entry = ~80 children.
        // Increased from 16 to 80 to flatten tree depth from 8 to 5 for Billion-Key scale.
        this.order = 80; 
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
	    // 1. Read Raw Buffer (Handle Chain vs Single)
	    let buffer;
	    if (ptr.isChain) {
	        // Calculate blocks needed based on length
	        // Note: Logic inside readSequential handles BigInt offset, passing standard numbers here for count is fine.
	        const endBlockId = Math.floor(((ptr.blockId * constants.BLOCK_SIZE) + ptr.offset + ptr.length - 1) / constants.BLOCK_SIZE);
	        const blocksToRead = (endBlockId - ptr.blockId) + 1;
	
	        const rawChain = await this.allocator.pager.readSequential(ptr.blockId, blocksToRead);
	        buffer = Buffer.alloc(ptr.length);
	        
	        let bufOffset = 0;
	        let rem = ptr.length;
	        
	        for (let i = 0; i < blocksToRead; i++) {
	            const blockView = rawChain.subarray(i * constants.BLOCK_SIZE, (i + 1) * constants.BLOCK_SIZE);
	            // First block uses ptr.offset, others use UNIT_SIZE (skip header)
	            const start = (i === 0) ? ptr.offset : constants.UNIT_SIZE;
	            const avail = constants.BLOCK_SIZE - start;
	            const copy = Math.min(rem, avail);
	            
	            blockView.copy(buffer, bufOffset, start, start + copy);
	            bufOffset += copy;
	            rem -= copy;
	        }
	    } else {
	        const block = await this.allocator.pager.readBlock(ptr.blockId);
	        buffer = block.subarray(ptr.offset, ptr.offset + ptr.length);
	    }
	
	    // 2. Deserialize Node Structure
	    let offset = 0;
	    
	    // Flags (1 byte)
	    const flags = buffer.readUInt8(offset); offset++;
	    const isLeaf = (flags & 1) === 1;
	
	    // Key Count (2 bytes)
	    const keyCount = buffer.readUInt16BE(offset); offset += 2;
	
	    // Keys (VarString Array)
	    const keys = [];
	    for (let i = 0; i < keyCount; i++) {
	        const k = serializer.readString(buffer, offset);
	        keys.push(k.value);
	        offset += k.bytesRead;
	    }
	
	    // Helper to read a Pointer structure (BlockID, Offset, Length, IsChain)
	    const readPtr = () => {
	        // CRITICAL FIX: Use 48-bit pointer for Block ID (6 bytes)
	        // varInt breaks at 2GB (32-bit). 48-bit ensures 281PB.
	        const blockId = readPointer48(buffer, offset); offset += 6;
	        
	        const o = serializer.readVarInt(buffer, offset); offset += o.bytesRead;
	        const l = serializer.readVarInt(buffer, offset); offset += l.bytesRead;
	        const c = buffer.readUInt8(offset); offset++;
	        return { blockId: blockId, offset: o.value, length: l.value, isChain: c === 1 };
	    };
	
	    const values = [];
	    const children = [];
	
	    if (isLeaf) {
	        // Leaf nodes have 1 Value pointer per Key
	        for (let i = 0; i < keyCount; i++) {
	            values.push(readPtr());
	        }
	    } else {
	        // Internal nodes have (KeyCount + 1) Child pointers
	        for (let i = 0; i <= keyCount; i++) {
	            children.push(readPtr());
	        }
	    }
	
	    // Subtree Count (4 bytes)
	    const count = buffer.readUInt32BE(offset);
	
	    return { isLeaf, keys, values, children, count, ptr };
	}

    async saveNode(node) {
	    // 1. Serialize to Buffer
	    const parts = [];
	    
	    // Flags
	    parts.push(Buffer.from([node.isLeaf ? 1 : 0]));
	    
	    // Key Count
	    const countBuf = Buffer.alloc(2);
	    countBuf.writeUInt16BE(node.keys.length);
	    parts.push(countBuf);
	
	    // Keys
	    for (let k of node.keys) {
	        parts.push(serializer.writeString(k));
	    }
	
	    // Helper to write pointer
	    const writePtr = (p) => {
	        const bBuf = Buffer.alloc(6);
	        writePointer48(bBuf, p.blockId, 0);
	        parts.push(bBuf);
	        
	        parts.push(serializer.writeVarInt(p.offset));
	        parts.push(serializer.writeVarInt(p.length));
	        parts.push(Buffer.from([p.isChain ? 1 : 0]));
	    };
	
	    // Pointers
	    if (node.isLeaf) {
	        for (let v of node.values) writePtr(v);
	    } else {
	        for (let c of node.children) writePtr(c);
	    }
	
	    // Total Count
	    const totalCountBuf = Buffer.alloc(4);
	    totalCountBuf.writeUInt32BE(node.count || 0);
	    parts.push(totalCountBuf);
	
	    const raw = Buffer.concat(parts);
	
        //Free the old location to prevent storage leaks (Infinite Growth)
        if (node.ptr) {
            await this.allocator.free(node.ptr);
        }

	    // 3. Allocate New Space
	    const newPtr = await this.allocator.allocate(raw.length);
	
	    // 4. Write Data to Disk
	    if (newPtr.isChain) {
	        let remaining = raw;
	        let currentBlock = newPtr.blockId;
	        
	        while (remaining.length > 0) {
	            const blk = await this.allocator.pager.readBlock(currentBlock);
	            const start = (currentBlock === newPtr.blockId) ? newPtr.offset : constants.UNIT_SIZE;
	            const avail = constants.BLOCK_SIZE - start;
	            const toWrite = Math.min(remaining.length, avail);
	            
	            remaining.subarray(0, toWrite).copy(blk, start);
	            await this.allocator.pager.writeBlock(currentBlock, blk);
	            
	            remaining = remaining.subarray(toWrite);
	            currentBlock++;
	        }
	    } else {
	        const blk = await this.allocator.pager.readBlock(newPtr.blockId);
	        raw.copy(blk, newPtr.offset);
	        await this.allocator.pager.writeBlock(newPtr.blockId, blk);
	    }
	
	    return newPtr;
	}

    async insert(key, valuePtr) {
        const root = await this.getRoot();
        const { newChild } = await this.insertRecursive(root, key, valuePtr);
        if (newChild) {
            // Root Split
            const newRoot = {
                isLeaf: false,
                keys: [newChild.key],
                children: [root.ptr, newChild.ptr],
                values: [],
                count: (root.count || 0) + (await this.getSubtreeCount(newChild.ptr))
            };
            this.rootPtr = await this.saveNode(newRoot);
        }
    }

    async insertRecursive(node, key, valuePtr) {
	    // Case 1: Leaf Node
	    if (node.isLeaf) {
	            let idx = 0;
	            while (idx < node.keys.length && node.keys[idx] < key) idx++;
	            
	            node.keys.splice(idx, 0, key);
	            node.values.splice(idx, 0, valuePtr);
	            node.count = (node.count || 0) + 1;
	            
	            // B"H: The Vessel must shatter to expand. Check for overflow.
	            if (node.keys.length > this.order) {
	                return await this.splitLeaf(node);
	            }
	
	            const savedPtr = await this.saveNode(node);
	            return { newChild: null, newPtr: savedPtr };
	        } 
	    
	    // Case 2: Internal Node
	    let idx = 0;
	    while (idx < node.keys.length && key >= node.keys[idx]) idx++;
	    
	    const childPtr = node.children[idx];
	    const childNode = await this.loadNode(childPtr);
	    
	    const result = await this.insertRecursive(childNode, key, valuePtr);
	    
	    // Update local count
	    node.count = (node.count || 0) + 1;
	    
	    // Handle Child Updates
	    if (result.newChild) {
	        // Child Split! Insert the new sibling key and pointer
	        node.keys.splice(idx, 0, result.newChild.key);
	        node.children.splice(idx + 1, 0, result.newChild.ptr);
	        
	        // Also update the pointer to the original child (it moved/shrank)
	        if (result.newPtr) {
	            node.children[idx] = result.newPtr;
	        }
	
	        // Check if we need to split ourselves now
	        if (node.children.length > this.order + 1) {
	            const splitRes = await this.splitInternal(node);
	            return splitRes; 
	        } else {
	            const savedPtr = await this.saveNode(node);
	            return { newChild: null, newPtr: savedPtr };
	        }
	    } else {
	        // No split, but child might have moved (re-allocated during save)
	        if (result.newPtr) {
	            node.children[idx] = result.newPtr;
	        }
	        const savedPtr = await this.saveNode(node);
	        return { newChild: null, newPtr: savedPtr };
	    }
	}

    async splitLeaf(node) {
        const mid = Math.floor(node.keys.length / 2);
        const sibling = {
            isLeaf: true,
            keys: node.keys.splice(mid),
            values: node.values.splice(mid),
            children: [],
            count: 0
        };
        sibling.count = sibling.keys.length;
        node.count = node.keys.length;

        const sibPtr = await this.saveNode(sibling);
        const nodePtr = await this.saveNode(node); // Resave trimmed node
        node.ptr = nodePtr;

        return { newChild: { key: sibling.keys[0], ptr: sibPtr } };
    }

    async splitInternal(node) {
        const mid = Math.floor(node.keys.length / 2);
        const upKey = node.keys[mid];
        
        const sibling = {
            isLeaf: false,
            keys: node.keys.splice(mid + 1),
            children: node.children.splice(mid + 1),
            values: [],
            count: 0
        };
        node.keys.pop(); // Remove upKey

        // Recalculate counts
        // This requires loading children to sum counts. Slow?
        // Optimization: Store counts in the parent's arrays?
        // For now, fast fix: set to 0 and let next lazy load fix it or approximate.
        // Better: We are in a write op. We perform the sum.
        sibling.count = await this.sumChildren(sibling.children);
        node.count = await this.sumChildren(node.children);

        const sibPtr = await this.saveNode(sibling);
        const nodePtr = await this.saveNode(node);
        node.ptr = nodePtr;

        return { newChild: { key: upKey, ptr: sibPtr } };
    }

    async sumChildren(childPtrs) {
        let sum = 0;
        for(let p of childPtrs) sum += await this.getSubtreeCount(p);
        return sum;
    }

    async getSubtreeCount(ptr) {
        // Optimization: We could store the count IN the pointer (if space allowed), 
        // but here we load the node header.
        // We can create a lightweight `loadHeader` method later.
        const node = await this.loadNode(ptr);
        return node.count;
    }
    
    
    /**
     * Finds the pointer associated with a specific key.
     * Returns null if not found.
     */
    async search(key) {
        const root = await this.getRoot();
        return await this.searchRecursive(root, key);
    }

    async searchRecursive(node, key) {
        if (node.isLeaf) {
            // Binary search within the leaf would be faster, but linear is fine for < 100 items
            const idx = node.keys.indexOf(key);
            if (idx !== -1) {
                return node.values[idx];
            }
            return null;
        }

        // Internal Node
        let idx = 0;
        // Logic: Find the first key that is GREATER than the target
        // The child at that index holds the range covering our target.
        while (idx < node.keys.length && key >= node.keys[idx]) idx++;
        
        // Recurse down
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
	    if (results.length >= limit) return; // Done
	
	    if (node.isLeaf) {
	        // In this leaf, we have items from rank `currentOffset` to `currentOffset + node.count`
	        // We need items starting at `startRank`
	        
	        const leafStart = currentOffset;
	        const leafEnd = currentOffset + node.count;
	
	        // If this leaf overlaps with our target range
	        if (leafEnd > startRank) {
	            // Calculate local index
	            // If startRank is 50, and leafStart is 40, we start at index 10.
	            let localIdx = Math.max(0, startRank - leafStart);
	            
	            while (localIdx < node.keys.length && results.length < limit) {
	                results.push({
	                    key: node.keys[localIdx],
	                    ptr: node.values[localIdx]
	                });
	                localIdx++;
	            }
	        }
	        return;
	    }
	
	    // Internal Node: Iterate Children using Counts
	    let accumulator = currentOffset;
	    for (let i = 0; i < node.children.length; i++) {
	        const childPtr = node.children[i];
	        
	        // Optimization: We need child count. 
	        // We load the node. (Ideally we'd cache count in parent, but for now we load).
	        const childNode = await this.loadNode(childPtr);
	        
	        const childCount = childNode.count;
	        
	        // Check intersection
	        const childStart = accumulator;
	        const childEnd = accumulator + childCount;
	        
	        if (childEnd > startRank) {
	            // Target range is inside this child (or partially)
	            await this.collectRange(childNode, startRank, limit, results, childStart);
	            if (results.length >= limit) return;
	        }
	        
	        accumulator += childCount;
	    }
	}
	
	
	
	
	/**
	 * Removes a key from the B-Tree.
	 * NOTE: This implementation performs 'Lazy Deletion' (removes key from leaf).
	 * It does NOT merge under-filled nodes, which preserves ID stability at the cost of slight fragmentation.
	 */
	async remove(key) {
	    const root = await this.getRoot();
	    const result = await this.removeRecursive(root, key);
	    
	    if (result.modified) {
	        // If root became empty and has children, we might shrink tree (optional optimization)
	        // For now, just save the changes.
	    }
	}
	
	async removeRecursive(node, key) {
	    if (node.isLeaf) {
	        // Find key
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
	
	    // Internal Node
	    let idx = 0;
	    while (idx < node.keys.length && key >= node.keys[idx]) idx++;
	    
	    // Recursively delete from child
	    const childPtr = node.children[idx];
	    const childNode = await this.loadNode(childPtr);
	    
	    const result = await this.removeRecursive(childNode, key);
	    
	    if (result.modified) {
	        // Update child pointer
	        node.children[idx] = result.newPtr;
	        node.count += result.countDelta;
	        
	        // If key was the separator in this internal node, strictly we might need to update it,
	        // but in B+ Trees, internal keys are just signposts. 
	        // If the key is deleted from the leaf, the signpost can remain until merge.
	        
	        const savedPtr = await this.saveNode(node);
	        return { modified: true, newPtr: savedPtr, countDelta: result.countDelta };
	    }
	    
	    return { modified: false, countDelta: 0 };
	}
}

module.exports = BTree;