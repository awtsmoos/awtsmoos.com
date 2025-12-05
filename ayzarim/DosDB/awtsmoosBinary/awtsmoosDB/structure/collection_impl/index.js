// B"H
const CollectionIO = require('./io.js');
const CollectionOps = require('./ops.js');
const CollectionRead = require('./read.js');
const IndexManager = require('../indexManager.js');

class Collection {
    constructor(rootBlockId, allocator) {
        this.headerId = rootBlockId;
        this.allocator = allocator;
        this.headPageId = 0;
        this.tailPageId = 0;
        this.totalCount = 0;
        this.registryPtr = null;
        this.MAGIC_HEAD = "CLHD";
        
        // Components
        this.indexManager = new IndexManager(allocator);
        this.io = new CollectionIO(this);
        this.ops = new CollectionOps(this);
        this.read = new CollectionRead(this);
        
        // Locks
        this.writeLock = Promise.resolve();
    }

    log(msg) { 
        if (this.allocator && this.allocator.db && this.allocator.db.debug) {
            console.log(`[Collection ${this.headerId}] ${msg}`); 
        }
    }

    async load() { return this.io.load(); }
    async saveHeader() { return this.io.saveHeader(); }
    
    async append(key, value) { return this.ops.append(key, value); }
    
    async getPage(pageIndex) { return this.read.getPage(pageIndex); }
    async delete(key) { return false; }
    async getSortedPage() { return []; }
}

module.exports = Collection;