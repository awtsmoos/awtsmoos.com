// B"H
const BTree = require('../../structure/btree.js');
const { _readPtr, TYPE_BTREE, TYPE_COLLECTION, SB_ROOT_PTR_OFFSET } = require('./utils.js');
const { readPointer48 } = require('../../utils/binaryHelpers.js');

class Navigator {
    constructor(handle) {
        this.handle = handle;
        this.db = handle.db;
    }

    async resolveChild(key, ptrPromise) {
        return ptrPromise.then(async (ptr) => {
            await this.db.ensureOpen();
            let tree;

            if (this.handle.mode === 'ROOT') {
                // B"H: Bypass db._loadRootTree() to ensure we read the absolutely latest 
                // SuperBlock state from disk/pager cache, avoiding any stale DB-level object caching.
                const sb = await this.db.allocator.pager.readBlock(0);
                if (!sb) throw new Error("B\"H: Critical - SuperBlock read failed in Navigator.");

                const rootId = readPointer48(sb, SB_ROOT_PTR_OFFSET);
                const rootOff = sb.readUInt32BE(SB_ROOT_PTR_OFFSET + 6);
                const rootLen = sb.readUInt32BE(SB_ROOT_PTR_OFFSET + 10);
                const isChain = sb.readUInt8(SB_ROOT_PTR_OFFSET + 14) === 1;

                let rootPtr = null;
                if (rootId !== 0 || rootOff !== 0) {
                    rootPtr = { blockId: rootId, offset: rootOff, length: rootLen, isChain };
                }
                
                tree = new BTree(this.db.allocator, rootPtr);
            } else {
                if (this.handle.mode === 'DEFERRED') await this.detectMode(ptr);
                
                if (this.handle.mode === 'BTREE') {
                    if (!ptr) return null;
                    const metaBuf = await this.db._readChainSafe(ptr);
                    if (!metaBuf) return null; 

                    const handlePtr = _readPtr(metaBuf, 1);
                    if (!handlePtr) return null;

                    const handleBuf = await this.db._readChainSafe(handlePtr);
                    if (!handleBuf) return null; 

                    if (handleBuf.length < 4 || handleBuf.toString('utf8', 0, 4) !== "TREE") {
                        return null;
                    }

                    const rootPtr = _readPtr(handleBuf, 4);
                    tree = new BTree(this.db.allocator, rootPtr);
                } else {
                    return null;
                }
            }

            const res = await tree.search(key);
            this.handle.log(`Search result for "${key}": ${res ? 'Found' : 'Null'}`);
            return res;
        });
    }

    async detectMode(ptr) {
        if (!ptr) { this.handle.mode = 'VALUE'; return; }
        const metaBuf = await this.db._readChainSafe(ptr);
        if (!metaBuf) { this.handle.mode = 'VALUE'; return; }
        const type = metaBuf.length > 0 ? metaBuf.readUInt8(0) : 0;
        
        this.handle.log(`Detect Mode: BlockType ${type}`);

        if (type === TYPE_BTREE) this.handle.mode = 'BTREE';
        else if (type === TYPE_COLLECTION) this.handle.mode = 'COLLECTION';
        else this.handle.mode = 'VALUE';
    }
}

module.exports = Navigator;