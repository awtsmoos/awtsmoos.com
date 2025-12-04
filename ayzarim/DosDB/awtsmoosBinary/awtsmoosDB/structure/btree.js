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
        // Optimization: 4096 bytes / ~50 bytes per entry = ~80 children.
        this.order = 80; 
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
	
	    let offset = 0;
	    
	    const flags = buffer.readUInt8(offset); offset++;
	    const isLeaf = (flags & 1) === 1;
	
	    const keyCount = buffer.readUInt16BE(offset); offset += 2;
	
	    const keys = [];
	    for (let i = 0; i < keyCount; i++) {
	        const k = serializer.readString(buffer, offset);
	        keys.push(k.value);
	        offset += k.bytesRead;
	    }
	
	    const readPtr = () => {
            if (offset + 6 > buffer.length) return { blockId: 0, offset: 0, length: 0, isChain: false };
	        const blockId = readPointer48(buffer, offset); offset += 6;
	        const o = serializer.readVarInt(buffer, offset); offset += o.bytesRead;
	        const l = serializer.readVarInt(buffer, offset); offset += l.bytesRead;
	        const c = buffer.readUInt8(offset); offset++;
	        return { blockId: blockId, offset: o.value, length: l.value, isChain: c === 1 };
	    };
	
	    const values = [];
	    const children = [];
	
	    if (isLeaf) {
	        for (let i = 0; i < keyCount; i++) {
	            values.push(readPtr());
	        }
	    } else {
	        for (let i = 0; i <= keyCount; i++) {
	            children.push(readPtr());
	        }
	    }
	
	    const count = buffer.readUInt32BE(offset);
        offset += 4;
        
        return { isLeaf, keys, values, children, count, ptr };
	}

    async saveNode(node) {
	    const parts = [];
	    
	    parts.push(Buffer.from([node.isLeaf ? 1 : 0]));
	    
	    const countBuf = Buffer.alloc(2);
	    countBuf.writeUInt16BE(node.keys.length);
	    parts.push(countBuf);
	
	    for (let k of node.keys) {
	        parts.push(serializer.writeString(k));
	    }
	
	    const writePtr = (p) => {
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
	
        // Note: We do NOT free the old pointer here immediately because BTree structure 
        // implies we might be in a Copy-On-Write transaction or need historical access.
        // For this simple DB, we just allocate new space. Freeing old space requires tracking 
        // if it is referenced elsewhere (unlikely here, but safer to leak slightly than corrupt).
        // Optimization: In a real DB, free `node.ptr` if safe.

	    const newPtr = await this.allocator.allocate(raw.length);
	
	    if (newPtr.isChain) {
            this.allocator.db._writeChainSafe(newPtr, raw);
	    } else {
            await this.allocator.writeUserSpace(newPtr, raw);
	    }
	
	    return newPtr;
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
	            while (idx < node.keys.length && node.keys[idx] < key) idx++;
	            
                // Duplicate handling: Overwrite if exists
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
	    while (idx < node.keys.length && key >= node.keys[idx]) idx++;
	    
	    const childPtr = node.children[idx];
	    const childNode = await this.loadNode(childPtr);
	    
	    const result = await this.insertRecursive(childNode, key, valuePtr);
	    
	    // Update child pointer if it changed (COW)
        if (result.newPtr) {
            node.children[idx] = result.newPtr;
        }

	    if (result.newChild) {
            // Child split. Insert key and new child pointer.
	        node.keys.splice(idx, 0, result.newChild.key);
	        node.children.splice(idx + 1, 0, result.newChild.ptr);
            
            // Recalculate count
            node.count = await this.sumChildren(node.children);
	
	        if (node.children.length > this.order + 1) {
	            return await this.splitInternal(node);
	        } else {
	            const savedPtr = await this.saveNode(node);
	            return { newChild: null, newPtr: savedPtr };
	        }
	    } else {
            // Child didn't split, but it might have grown.
            // Just update count and save.
	        node.count = await this.sumChildren(node.children);
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
        const nodePtr = await this.saveNode(node); 
        node.ptr = nodePtr;

        // B"H: FIX - Return newPtr of the modified left node!
        return { newChild: { key: sibling.keys[0], ptr: sibPtr }, newPtr: nodePtr };
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

        sibling.count = await this.sumChildren(sibling.children);
        node.count = await this.sumChildren(node.children);

        const sibPtr = await this.saveNode(sibling);
        const nodePtr = await this.saveNode(node);
        node.ptr = nodePtr;

        // B"H: FIX - Return newPtr of the modified left node!
        return { newChild: { key: upKey, ptr: sibPtr }, newPtr: nodePtr };
    }

    async sumChildren(childPtrs) {
        let sum = 0;
        for(let p of childPtrs) sum += await this.getSubtreeCount(p);
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
	        const leafStart = currentOffset;
	        const leafEnd = currentOffset + node.count;
	
	        if (leafEnd > startRank) {
                let localIdx = 0;
	            if (startRank > leafStart) {
                    localIdx = startRank - leafStart;
                }
	            
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
	
	    let accumulator = currentOffset;
	    for (let i = 0; i < node.children.length; i++) {
            if (results.length >= limit) return;
            
	        const childPtr = node.children[i];
	        const childNode = await this.loadNode(childPtr);
	        const childCount = childNode.count;
	        
	        const childEnd = accumulator + childCount;
	        
	        if (childEnd > startRank) {
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