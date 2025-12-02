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

class BTree {
    constructor(allocator, rootPtr = null) {
        this.allocator = allocator;
        this.rootPtr = rootPtr;
        this.order = 80; 
    }

    async getRoot() {
        if (!this.rootPtr) {
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
	        const block = await this.allocator.pager.readBlock(ptr.blockId);
            if (!block) throw new Error(`Block ${ptr.blockId} missing`);
	        buffer = block.subarray(ptr.offset, ptr.offset + ptr.length);
	    }
	
	    let offset = 0;
        if (buffer.length < 3) throw new Error("BTree Node Corruption: Buffer too small");

	    const flags = buffer.readUInt8(offset); offset++;
	    const isLeaf = (flags & 1) === 1;
	    const keyCount = buffer.readUInt16BE(offset); offset += 2;
	
	    const keys = [];
	    for (let i = 0; i < keyCount; i++) {
            if (offset >= buffer.length) break;
	        const k = serializer.readString(buffer, offset);
	        keys.push(k.value);
	        offset += k.bytesRead;
	    }
	
	    const readPtr = () => {
	        if (offset + 9 > buffer.length) {
                 return { blockId: 0, offset: 0, length: 0, isChain: false };
	        }
	        const blockId = readPointer48(buffer, offset); offset += 6;
	        const o = serializer.readVarInt(buffer, offset); offset += o.bytesRead;
	        const l = serializer.readVarInt(buffer, offset); offset += l.bytesRead;
	        const c = buffer.readUInt8(offset); offset++;
	        return { blockId: blockId, offset: o.value, length: l.value, isChain: c === 1 };
	    };
	
	    const values = [];
	    const children = [];
	
	    if (isLeaf) {
	        for (let i = 0; i < keyCount; i++) values.push(readPtr());
	    } else {
	        for (let i = 0; i <= keyCount; i++) children.push(readPtr());
	    }
	
        let count = 0;
        if (offset + 4 <= buffer.length) {
    	    count = buffer.readUInt32BE(offset);
        } 
	
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
	
	    const raw = Buffer.concat(parts);
        if (node.ptr) await this.allocator.free(node.ptr);
	    const newPtr = await this.allocator.allocate(raw.length);
	
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
	        // SHARED BLOCK WRITE FIX
	        await this.allocator.writeUserSpace(newPtr, raw);
	    }
	    return newPtr;
	}

    async insert(key, valuePtr) {
        const root = await this.getRoot();
        const { newChild } = await this.insertRecursive(root, key, valuePtr);
        if (newChild) {
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
        if (node.isLeaf) {
            let idx = 0;
            while (idx < node.keys.length && node.keys[idx] < key) idx++;
            node.keys.splice(idx, 0, key);
            node.values.splice(idx, 0, valuePtr);
            node.count = (node.count || 0) + 1;
            if (node.keys.length > this.order) return await this.splitLeaf(node);
            const savedPtr = await this.saveNode(node);
            return { newChild: null, newPtr: savedPtr };
        } 
        let idx = 0;
        while (idx < node.keys.length && key >= node.keys[idx]) idx++;
        const childPtr = node.children[idx];
        const childNode = await this.loadNode(childPtr);
        const result = await this.insertRecursive(childNode, key, valuePtr);
        node.count = (node.count || 0) + 1;
        if (result.newChild) {
            node.keys.splice(idx, 0, result.newChild.key);
            node.children.splice(idx + 1, 0, result.newChild.ptr);
            if (result.newPtr) node.children[idx] = result.newPtr;
            if (node.children.length > this.order + 1) return await this.splitInternal(node);
            else {
                const savedPtr = await this.saveNode(node);
                return { newChild: null, newPtr: savedPtr };
            }
        } else {
            if (result.newPtr) node.children[idx] = result.newPtr;
            const savedPtr = await this.saveNode(node);
            return { newChild: null, newPtr: savedPtr };
        }
    }
    
    async splitLeaf(node) {
        const mid = Math.floor(node.keys.length / 2);
        const sibling = { isLeaf: true, keys: node.keys.splice(mid), values: node.values.splice(mid), children: [], count: 0 };
        sibling.count = sibling.keys.length;
        node.count = node.keys.length;
        const sibPtr = await this.saveNode(sibling);
        const nodePtr = await this.saveNode(node); 
        node.ptr = nodePtr;
        return { newChild: { key: sibling.keys[0], ptr: sibPtr } };
    }

    async splitInternal(node) {
        const mid = Math.floor(node.keys.length / 2);
        const upKey = node.keys[mid];
        const sibling = { isLeaf: false, keys: node.keys.splice(mid + 1), children: node.children.splice(mid + 1), values: [], count: 0 };
        node.keys.pop(); 
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
            if (idx !== -1) return node.values[idx];
            return null;
        }
        let idx = 0;
        while (idx < node.keys.length && key >= node.keys[idx]) idx++;
        const childPtr = node.children[idx];
        const childNode = await this.loadNode(childPtr);
        return await this.searchRecursive(childNode, key);
    }
    async remove(key) {
        const root = await this.getRoot();
        const result = await this.removeRecursive(root, key);
        if (result.modified) this.rootPtr = result.newPtr;
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