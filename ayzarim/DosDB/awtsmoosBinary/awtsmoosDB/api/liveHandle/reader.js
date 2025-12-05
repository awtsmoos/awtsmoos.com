// B"H
const Collection = require('../../structure/collection.js');
const v1Adapter = require('../../deserialize/v1_adapter.js');
const { _readPtr } = require('./utils.js');

class Reader {
    constructor(handle, LiveHandleClass) {
        this.handle = handle;
        this.db = handle.db;
        this.LiveHandleClass = LiveHandleClass;
    }

    async resolveSelf() {
        const ptr = await this.handle.ptrPromise;
        if (!ptr && this.handle.mode !== 'ROOT') return undefined;
        if (this.handle.mode === 'ROOT') return "[AwtsmoosDB Root]";
        
        if (this.handle.mode === 'DEFERRED') await this.handle.nav.detectMode(ptr);

        if (this.handle.mode === 'BTREE' || this.handle.mode === 'COLLECTION') {
            return this.toJSON();
        }
        
        return await this.db._resolveValueFull(ptr);
    }

    async toJSON(depth = 0) {
        if (depth > 5) return "[Max Depth Exceeded]";
        const ptr = await this.handle.ptrPromise;
        if (!ptr) return undefined;
        if (this.handle.mode === 'DEFERRED') await this.handle.nav.detectMode(ptr);
        
        if (this.handle.mode === 'BTREE') {
            const tree = await this.handle.tree.getCurrentTree(ptr);
            const allItems = await tree.getRange(0, 500); 
            const result = {};
            for(const item of allItems) {
                const childHandle = new this.LiveHandleClass(this.db, Promise.resolve(item.ptr), 'DEFERRED');
                result[item.key] = await childHandle.toJSON(depth + 1);
            }
            return result;
        } 
        else if (this.handle.mode === 'COLLECTION') {
            return this.slice(0, 500); 
        } 
        else {
             return this.db._resolveValueFull(ptr);
        }
    }

    async slice(start = 0, end = 100) {
        this.handle.log(`Slice ${start}-${end} requested.`);
        const ptr = await this.handle.ptrPromise;
        await this.db.ensureOpen();
        
        if (this.handle.mode === 'DEFERRED') await this.handle.nav.detectMode(ptr);
        if (this.handle.mode !== 'COLLECTION') {
            this.handle.log("Slice called on non-collection.");
            return [];
        }

        const metaBuf = await this.db._readChainSafe(ptr);
        const handlePtr = _readPtr(metaBuf, 1);
        const handleBuf = await this.db._readChainSafe(handlePtr);
        
        if (!handleBuf || handleBuf.length < 4 || handleBuf.toString('utf8', 0, 4) !== "COLL") {
            this.handle.log("Invalid Collection Signature.");
            return [];
        }

        const headerPtr = _readPtr(handleBuf, 4);
        if (!headerPtr || headerPtr.blockId === 0) {
             this.handle.log("Invalid Header Pointer.");
             return [];
        }

        const col = new Collection(headerPtr.blockId, this.db.allocator);
        await col.load();
        
        this.handle.log(`Collection Loaded. Head: ${col.headPageId}, Total: ${col.totalCount}`);

        const res = [];
        let currPage = col.headPageId;
        let count = 0;
        
        while(currPage !== 0 && count < end) {
            const page = new (require('../../structure/page.js'))(currPage, this.db.allocator);
            await page.load();
            
            for(let item of page.items) {
                if (count >= start && count < end) {
                     const valBuf = await this.db._readChainSafe(item.ptr);
                     res.push(v1Adapter.decode(valBuf, item.type));
                }
                count++;
                if (count >= end) break;
            }
            currPage = page.nextPageId;
        }
        return res;
    }

    async *iterator() {
        const ptr = await this.handle.ptrPromise;
        await this.db.ensureOpen();
        if (this.handle.mode === 'DEFERRED') await this.handle.nav.detectMode(ptr);
        if (this.handle.mode === 'COLLECTION') {
             const metaBuf = await this.db._readChainSafe(ptr);
             const handlePtr = _readPtr(metaBuf, 1);
             const handleBuf = await this.db._readChainSafe(handlePtr);
             const headerPtr = _readPtr(handleBuf, 4);
             const col = new Collection(headerPtr.blockId, this.db.allocator);
             await col.load();
             let currPage = col.headPageId;
             while(currPage !== 0) {
                const page = new (require('../../structure/page.js'))(currPage, this.db.allocator);
                await page.load();
                for(let item of page.items) {
                    const valBuf = await this.db._readChainSafe(item.ptr);
                    yield v1Adapter.decode(valBuf, item.type);
                }
                currPage = page.nextPageId;
             }
        }
    }
}

module.exports = Reader;
