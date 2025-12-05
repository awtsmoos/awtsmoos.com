// B"H
const constants = require('../../constants.js');
// B"H: Switched to modular IO
const NodeIO = require('./io/index.js');
const Ops = require('./ops.js');
const Query = require('./query.js');

class BTree {
    constructor(allocator, rootPtr = null) {
        this.allocator = allocator;
        this.rootPtr = rootPtr;
        // Low order to force splits and exercise logic freqently
        this.order = 10; 
        
        // Components
        this.io = new NodeIO(this);
        this.ops = new Ops(this);
        this.query = new Query(this);

        // B"H: Transactional Free List
        // We accumulate nodes to be freed here and only release them
        // once the new root is securely anchored in the SuperBlock/Handle.
        this.pendingFrees = [];
    }

    log(msg) {
        if (this.allocator && this.allocator.db && this.allocator.db.debug) {
            console.log(`[BTree] ${msg}`);
        }
    }

    // B"H: Defer-Free Mechanism
    registerFree(ptr) {
        if (ptr && ptr.blockId !== 0) {
            this.pendingFrees.push(ptr);
        }
    }

    async flushFrees() {
        if (this.pendingFrees.length === 0) return;
        this.log(`Flushing ${this.pendingFrees.length} deferred frees.`);
        for(const ptr of this.pendingFrees) {
            await this.allocator.free(ptr);
        }
        this.pendingFrees = [];
    }

    // Facade Methods
    async getRoot() { return this.io.getRoot(); }
    async loadNode(ptr) { return this.io.loadNode(ptr); }
    async saveNode(node) { return this.io.saveNode(node); }
    
    async insert(key, valuePtr) { return this.ops.insert(key, valuePtr); }
    async remove(key) { return this.ops.remove(key); }
    
    async search(key) { return this.query.search(key); }
    async getRange(startRank, limit) { return this.query.getRange(startRank, limit); }
    
    // Helpers used by sub-modules
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
}

module.exports = BTree;