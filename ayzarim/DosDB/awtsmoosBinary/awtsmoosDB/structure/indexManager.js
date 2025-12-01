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
	    
	    // If no registry pointer exists (New DB), init empty
	    if (!registryPtr || registryPtr.length === 0) {
	        this.indexes = new Map();
	        return;
	    }
	
	    // Load Registry Block
	    // We treat the registry as a simple JSON object stored in a block/chain.
	    // Re-use logic similar to resolvePointer, but simplified for internal use.
	    let buffer;
	    if (registryPtr.isChain) {
	        const startOffsetInFile = (registryPtr.blockId * constants.BLOCK_SIZE) + registryPtr.offset;
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
	
	    // Parse JSON
	    try {
	        const json = JSON.parse(buffer.toString('utf8'));
	        this.indexes = new Map();
	        for (let key in json) {
	            // Reconstruct BTree instances
	            const ptr = json[key]; // { blockId, offset, length, isChain }
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
	
	    // Convert Map<Path, BTree> to Object<Path, RootPtr>
	    const exportObj = {};
	    for (let [path, tree] of this.indexes) {
	        // We need the root pointer of the tree
	        // Note: BTree.rootPtr might change during inserts.
	        if (tree.rootPtr) {
	            exportObj[path] = tree.rootPtr;
	        }
	    }
	
	    const raw = Buffer.from(JSON.stringify(exportObj), 'utf8');
	
	    // Free old registry
	    if (this.registryPtr) {
	        await this.allocator.free(this.registryPtr);
	    }
	
	    // Allocate & Write
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
	        const blk = await this.allocator.pager.readBlock(newPtr.blockId);
	        raw.copy(blk, newPtr.offset);
	        await this.allocator.pager.writeBlock(newPtr.blockId, blk);
	    }
	
	    this.registryPtr = newPtr;
	    this.dirty = false;
	    return newPtr; // Return to caller to save in Header
	}

    /**
     * Main Entry: Indexes an object asynchronously
     */
    indexObject(dataPtr, object) {
        // Fire and Forget (Queue)
        const task = async () => {
            const paths = this.flatten(object);
            for (let { path, value } of paths) {
                // Use the helper method to ensure Cache Eviction runs
                let tree = this.getOrCreateIndex(path); 
                
                // Convert value to sortable key (string/number)
                const key = String(value).substring(0, 64); // Limit key size
                await tree.insert(key, dataPtr);
            }
            await this.saveRegistry();
        };

        this.queue = this.queue.then(task).catch(err => console.error("Index Error:", err));
    }

    flatten(obj, prefix = '', res = []) {
        if (prefix.split('.').length > 10) return res; // Max Depth Safety
        
        for (let key in obj) {
            if (!Object.hasOwnProperty.call(obj, key)) continue;
            const val = obj[key];
            const newKey = prefix ? `${prefix}.${key}` : key;
            
            if (val && typeof val === 'object' && !Array.isArray(val)) {
                this.flatten(val, newKey, res);
            } else if (Array.isArray(val)) {
                 // Array Indexing: Index EACH item
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
            // Move to end (Recently Used)
            const tree = this.indexes.get(path);
            this.indexes.delete(path);
            this.indexes.set(path, tree);
            return tree;
        }

        // Cache Eviction
        if (this.indexes.size >= this.MAX_OPEN_INDEXES) {
            // Remove the first key (Oldest)
            const firstKey = this.indexes.keys().next().value;
            this.indexes.delete(firstKey);
            // Note: We don't need to "close" the tree because it's stateless 
            // except for the root pointer, which is saved in registry.
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
	                // Convert value to string key
	                const key = String(value).substring(0, 64);
	                
	                // Perform removal
	                await tree.remove(key);
	                anyChange = true;
	            }
	        }
	        
	        if (anyChange) {
	            this.dirty = true;
	            await this.saveRegistry();
	        }
	    };
	    
	    // Queue execution to ensure thread safety
	    this.queue = this.queue.then(task).catch(err => console.error("B\"H Index Delete Error:", err));
	    return this.queue;
	}
}

module.exports = IndexManager;