// B"H
const Collection = require('../../structure/collection.js');
const v1Adapter = require('../../deserialize/v1_adapter.js');
const { _readPtr } = require('./utils.js');
const Page = require('../../structure/page.js');

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
        
        // B"H: If ptr has explicit type (from Collection), trust it and decode directly.
        if (ptr && ptr.type !== undefined) {
             const valBuf = await this.db._readChainSafe(ptr);
             return v1Adapter.decode(valBuf, ptr.type);
        }

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
        
        // B"H: Direct decode for typed pointers
        if (ptr.type !== undefined) {
             const valBuf = await this.db._readChainSafe(ptr);
             return v1Adapter.decode(valBuf, ptr.type);
        }

        if (this.handle.mode === 'DEFERRED') await this.handle.nav.detectMode(ptr);
        
        if (this.handle.mode === 'BTREE') {
            const tree = await this.handle.tree.getCurrentTree(ptr);
            const allItems = await tree.getRange(0, 500); 
            const result = {};
            for(const item of allItems) {
                const val = await this.db._resolveValueFull(item.ptr);
                result[item.key] = val;
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
            const page = new Page(currPage, this.db.allocator);
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

    // B"H: Fast Length Retrieval (O(1))
    async length() {
        const ptr = await this.handle.ptrPromise;
        if (!ptr) return 0;
        await this.db.ensureOpen();
        
        if (this.handle.mode === 'DEFERRED') await this.handle.nav.detectMode(ptr);

        if (this.handle.mode === 'BTREE') {
            const tree = await this.handle.tree.getCurrentTree(ptr);
            const root = await tree.getRoot();
            return root.count || 0;
        } 
        else if (this.handle.mode === 'COLLECTION') {
             const metaBuf = await this.db._readChainSafe(ptr);
             const handlePtr = _readPtr(metaBuf, 1);
             const handleBuf = await this.db._readChainSafe(handlePtr);
             const headerPtr = _readPtr(handleBuf, 4);
             
             const col = new Collection(headerPtr.blockId, this.db.allocator);
             await col.load();
             return col.totalCount;
        }
        return 0;
    }

    async *keys() { yield* this._iterateGeneric('KEY'); }
    async *values() { yield* this._iterateGeneric('VALUE'); }
    async *entries() { yield* this._iterateGeneric('ENTRY'); }
    
    // Default Iterator (Value for List, Entry for Map for backwards compat)
    async *iterator() {
        yield* this._iterateGeneric('DEFAULT');
    }

    async *_iterateGeneric(mode) {
        const ptr = await this.handle.ptrPromise;
        await this.db.ensureOpen();
        if (this.handle.mode === 'DEFERRED') await this.handle.nav.detectMode(ptr);
        
        if (this.handle.mode === 'BTREE') {
            const tree = await this.handle.tree.getCurrentTree(ptr);
            yield* this._iterateTree(tree, tree.rootPtr, mode);
        }
        else if (this.handle.mode === 'COLLECTION') {
             const metaBuf = await this.db._readChainSafe(ptr);
             const handlePtr = _readPtr(metaBuf, 1);
             const handleBuf = await this.db._readChainSafe(handlePtr);
             const headerPtr = _readPtr(handleBuf, 4);
             const col = new Collection(headerPtr.blockId, this.db.allocator);
             await col.load();
             let currPage = col.headPageId;
             while(currPage !== 0) {
                const page = new Page(currPage, this.db.allocator);
                await page.load();
                for(let item of page.items) {
                    if (mode === 'KEY') {
                        yield item.key; 
                    } else if (mode === 'ENTRY') {
                        const valBuf = await this.db._readChainSafe(item.ptr);
                        const val = v1Adapter.decode(valBuf, item.type);
                        yield [item.key, val];
                    } else {
                        // VALUE or DEFAULT
                        const valBuf = await this.db._readChainSafe(item.ptr);
                        yield v1Adapter.decode(valBuf, item.type);
                    }
                }
                currPage = page.nextPageId;
             }
        }
    }

    async *_iterateTree(tree, nodePtr, mode) {
        if (!nodePtr || nodePtr.blockId === 0) return;
        
        const node = await tree.loadNode(nodePtr);
        
        if (node.isLeaf) {
            for(let i = 0; i < node.keys.length; i++) {
                const key = node.keys[i];
                
                if (mode === 'KEY') {
                    yield key;
                } else {
                    const valPtr = node.values[i];
                    const value = await this.db._resolveValueFull(valPtr);
                    
                    if (mode === 'VALUE') yield value;
                    else if (mode === 'ENTRY') yield [key, value];
                    else yield { key, value }; // DEFAULT: { key, value } obj for BTree
                }
            }
        } else {
            for(const childPtr of node.children) {
                yield* this._iterateTree(tree, childPtr, mode);
            }
        }
    }
}

module.exports = Reader;