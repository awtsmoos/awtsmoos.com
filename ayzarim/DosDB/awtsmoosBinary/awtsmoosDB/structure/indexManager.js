// B"H
// structure/indexManager.js
const BTree = require('./btree.js');
const constants = require('../constants.js');

class IndexManager {
    constructor(allocator) {
        this.allocator = allocator;
        this.indexes = new Map(); // path -> BTree Instance
        this.registryPtr = null;
        this.dirty = false;
        this.queue = Promise.resolve();
        
        this.MAX_OPEN_INDEXES = 500; 
    }

    async load(registryPtr) {
	    this.registryPtr = registryPtr;
	    
	    if (!registryPtr || registryPtr.length === 0) {
	        this.indexes = new Map();
	        return;
	    }
	
	    let buffer;
	    if (registryPtr.isChain) {
	        const endBlockId = Math.floor(((registryPtr.blockId * constants.BLOCK_SIZE) + registryPtr.offset + registryPtr.length - 1) / constants.BLOCK_SIZE);
	        const blocksToRead = (endBlockId - registryPtr.blockId) + 1;
	
	        const rawChain = await this.allocator.pager.readSequential(registryPtr.blockId, blocksToRead);
	        buffer = Buffer.alloc(registryPtr.length);
	        
	        let bufOffset = 0;
	        let rem = registryPtr.length;
	        for (let i = 0; i < blocksToRead; i++) {
	            const blockView = rawChain.subarray(i * constants.BLOCK_SIZE, (i + 1) * constants.BLOCK_SIZE);
	            const start = (i === 0) ? registryPtr.offset : constants.UNIT_SIZE;
	            const avail = constants.BLOCK_SIZE - start;
	            const copy = Math.min(rem, avail);
	            
	            blockView.copy(buffer, bufOffset, start, start + copy);
	            bufOffset += copy;
	            rem -= copy;
	        }
	    } else {
	        const block = await this.allocator.pager.readBlock(registryPtr.blockId);
	        buffer = block.subarray(registryPtr.offset, registryPtr.offset + registryPtr.length);
	    }
	
	    try {
	        const json = JSON.parse(buffer.toString('utf8'));
	        this.indexes = new Map();
	        for (let key in json) {
	            const ptr = json[key]; 
	            const tree = new BTree(this.allocator, ptr);
	            this.indexes.set(key, tree);
	        }
	    } catch (e) {
	        console.error("B\"H: Corrupt Index Registry, resetting.", e);
	        this.indexes = new Map();
	    }
	}

    async saveRegistry() {
	    if (!this.dirty) return null;
	
	    const exportObj = {};
	    for (let [path, tree] of this.indexes) {
	        if (tree.rootPtr) {
	            exportObj[path] = tree.rootPtr;
	        }
	    }
	
	    const raw = Buffer.from(JSON.stringify(exportObj), 'utf8');
	
	    if (this.registryPtr) {
	        await this.allocator.free(this.registryPtr);
	    }
	
	    const newPtr = await this.allocator.allocate(raw.length);
	
	    if (newPtr.isChain) {
	        let remaining = raw;
	        let currentBlock = newPtr.blockId;
	        while (remaining.length > 0) {
	            const blk = await this.allocator.pager.readBlock(currentBlock);
	            const start = (currentBlock === newPtr.blockId) ? newPtr.offset : constants.UNIT_SIZE;
	            const avail = constants.BLOCK_SIZE - start;
	            const chunk = Math.min(remaining.length, avail);
	            remaining.subarray(0, chunk).copy(blk, start);
	            await this.allocator.pager.writeBlock(currentBlock, blk);
	            remaining = remaining.subarray(chunk);
	            currentBlock++;
	        }
	    } else {
            // SHARED BLOCK WRITE FIX
	        await this.allocator.writeUserSpace(newPtr, raw);
	    }
	
	    this.registryPtr = newPtr;
	    this.dirty = false;
	    return newPtr;
	}

    indexObject(dataPtr, object) {
        const task = async () => {
            const paths = this.flatten(object);
            for (let { path, value } of paths) {
                let tree = this.getOrCreateIndex(path); 
                const key = String(value).substring(0, 64);
                await tree.insert(key, dataPtr);
            }
            await this.saveRegistry();
        };

        // B"H: Propagate error to main queue so app can detect failure
        this.queue = this.queue.then(task);
    }

    flatten(obj, prefix = '', res = []) {
        if (prefix.split('.').length > 10) return res; 
        for (let key in obj) {
            if (!Object.hasOwnProperty.call(obj, key)) continue;
            const val = obj[key];
            const newKey = prefix ? `${prefix}.${key}` : key;
            if (val && typeof val === 'object' && !Array.isArray(val)) {
                this.flatten(val, newKey, res);
            } else if (Array.isArray(val)) {
                 val.forEach(v => {
                     if (typeof v !== 'object') res.push({ path: newKey, value: v });
                 });
            } else {
                res.push({ path: newKey, value: val });
            }
        }
        return res;
    }
    
    getOrCreateIndex(path) {
        if (this.indexes.has(path)) {
            const tree = this.indexes.get(path);
            this.indexes.delete(path);
            this.indexes.set(path, tree);
            return tree;
        }

        if (this.indexes.size >= this.MAX_OPEN_INDEXES) {
            const firstKey = this.indexes.keys().next().value;
            this.indexes.delete(firstKey);
        }

        const tree = new BTree(this.allocator);
        this.indexes.set(path, tree);
        return tree;
    }

	async deleteObject(object) {
	    const task = async () => {
	        const paths = this.flatten(object);
	        let anyChange = false;
	
	        for (let { path, value } of paths) {
	            const tree = this.indexes.get(path);
	            if (tree) {
	                const key = String(value).substring(0, 64);
	                await tree.remove(key);
	                anyChange = true;
	            }
	        }
	        if (anyChange) {
	            this.dirty = true;
	            await this.saveRegistry();
	        }
	    };
	    this.queue = this.queue.then(task);
	    return this.queue;
	}
}

module.exports = IndexManager;