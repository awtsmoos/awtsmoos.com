// B"H
/**
 * @file liveHandle.js
 * @description
 *  The Yadayim (Hands) of the Database.
 *  Handles the chaining of potentiality (Promises) into actuality (Values).
 */

const BTree = require('../structure/btree.js');
const Collection = require('../structure/collection.js');
const v1Adapter = require('../deserialize/v1_adapter.js');
const constants = require('../constants.js');
const { writePointer48, readPointer48 } = require('../utils/binaryHelpers.js');

// Redefine constants
const TYPE_RAW = 1;
const TYPE_BTREE = 2;
const TYPE_COLLECTION = 3;

class LiveHandle {
    /**
     * @param {Object} db - The AwtsmoosDB Instance
     * @param {Promise<Object>} ptrPromise - Resolves to the MetaBlock Ptr
     * @param {string} mode - 'ROOT', 'BTREE', 'COLLECTION', 'VALUE', 'DEFERRED'
     */
    constructor(db, ptrPromise, mode = 'VALUE') {
        this.db = db;
        this.ptrPromise = ptrPromise;
        this.mode = mode;

        return new Proxy(this, {
            get: (target, prop) => {
                if (prop === 'then') return (res, rej) => target.resolveSelf().then(res, rej);
                if (prop === 'catch') return (cb) => target.resolveSelf().catch(cb);
                if (prop === 'finally') return (cb) => target.resolveSelf().finally(cb);
                
                if (prop === Symbol.asyncIterator) return target.iterator.bind(target);
                
                if (prop === 'constructor') return LiveHandle;
                if (prop === 'toString') return () => `[LiveHandle ${target.mode}]`;
                if (prop === 'toJSON') return target.toJSON.bind(target);

                if (prop === 'push') return target.push.bind(target);
                if (prop === 'slice') return target.slice.bind(target);
                if (prop === 'delete' || prop === 'deleteProperty') return target.delete.bind(target);
                // B"H: Fix - Expose set method
                if (prop === 'set') return target.set.bind(target);
                
                if (prop === 'createMap') return target.createMap.bind(target);
                if (prop === 'createList') return target.createList.bind(target);

                return target.navigate(prop);
            },
            set: (target, prop, value) => {
                target.db.execute(() => target.set(prop, value))
                    .catch(e => console.error(`[LiveHandle] Set Error on ${prop}:`, e));
                return true; 
            },
            deleteProperty: (target, prop) => {
                target.db.execute(() => target.delete(prop))
                    .catch(e => console.error(`[LiveHandle] Delete Error on ${prop}:`, e));
                return true;
            }
        });
    }

    log(msg) {
        if (this.db && this.db.debug) {
            console.log(`[LiveHandle ${this.mode}] ${msg}`);
        }
    }

    _writePtr(buf, offset, ptr) {
        if (!ptr) throw new Error("B\"H: Cannot write null pointer");
        writePointer48(buf, ptr.blockId, offset);
        buf.writeUInt32BE(ptr.offset, offset + 6);
        buf.writeUInt32BE(ptr.length, offset + 10);
        buf.writeUInt8(ptr.isChain ? 1 : 0, offset + 14);
    }

    _readPtr(buf, offset) {
        if (!buf || offset >= buf.length) return null;
        if (offset + 15 > buf.length) return null;

        const blockId = readPointer48(buf, offset);
        const o = buf.readUInt32BE(offset + 6);
        const l = buf.readUInt32BE(offset + 10);
        const c = buf.readUInt8(offset + 14);
        
        if (l === 0) return null;
        if (blockId === 0 && o === 0) return null;

        return { blockId, offset: o, length: l, isChain: c === 1 };
    }

    navigate(key) {
        this.log(`Navigating to child: "${key}"`);
        const nextPromise = this.ptrPromise.then(async (ptr) => {
            await this.db.ensureOpen();
            let tree;

            if (this.mode === 'ROOT') {
                tree = await this.db._loadRootTree();
            } else {
                if (this.mode === 'DEFERRED') await this.detectMode(ptr);
                
                if (this.mode === 'BTREE') {
                    if (!ptr) return null;
                    const metaBuf = await this.db._readChainSafe(ptr);
                    if (!metaBuf) return null; 

                    const handlePtr = this._readPtr(metaBuf, 1);
                    if (!handlePtr) return null;

                    const handleBuf = await this.db._readChainSafe(handlePtr);
                    if (!handleBuf) return null; 

                    if (handleBuf.length < 4 || handleBuf.toString('utf8', 0, 4) !== "TREE") {
                        return null;
                    }

                    const rootPtr = this._readPtr(handleBuf, 4);
                    tree = new BTree(this.db.allocator, rootPtr);
                } else {
                    return null;
                }
            }

            const res = await tree.search(key);
            this.log(`Search result for "${key}": ${res ? 'Found' : 'Null'}`);
            return res;
        });

        return new LiveHandle(this.db, nextPromise, 'DEFERRED');
    }

    async resolveSelf() {
        const ptr = await this.ptrPromise;
        if (!ptr && this.mode !== 'ROOT') return undefined;
        if (this.mode === 'ROOT') return "[AwtsmoosDB Root]";
        
        if (this.mode === 'DEFERRED') await this.detectMode(ptr);

        if (this.mode === 'BTREE' || this.mode === 'COLLECTION') {
            return this.toJSON();
        }
        
        return await this.db._resolveValueFull(ptr);
    }

    async detectMode(ptr) {
        if (!ptr) { this.mode = 'VALUE'; return; }
        const metaBuf = await this.db._readChainSafe(ptr);
        if (!metaBuf) { this.mode = 'VALUE'; return; }
        const type = metaBuf.length > 0 ? metaBuf.readUInt8(0) : 0;
        
        this.log(`Detect Mode: BlockType ${type}`);

        if (type === TYPE_BTREE) this.mode = 'BTREE';
        else if (type === TYPE_COLLECTION) this.mode = 'COLLECTION';
        else this.mode = 'VALUE';
    }

    async toJSON(depth = 0) {
        if (depth > 5) return "[Max Depth Exceeded]";
        const ptr = await this.ptrPromise;
        if (!ptr) return undefined;
        if (this.mode === 'DEFERRED') await this.detectMode(ptr);
        
        if (this.mode === 'BTREE') {
            const tree = await this._getCurrentTree(ptr);
            const allItems = await tree.getRange(0, 500); 
            const result = {};
            for(const item of allItems) {
                const childHandle = new LiveHandle(this.db, Promise.resolve(item.ptr), 'DEFERRED');
                result[item.key] = await childHandle.toJSON(depth + 1);
            }
            return result;
        } 
        else if (this.mode === 'COLLECTION') {
            return this.slice(0, 500); 
        } 
        else {
             return this.db._resolveValueFull(ptr);
        }
    }

    async _getCurrentTree(ptr) {
        if (this.mode === 'ROOT') {
            return await this.db._loadRootTree();
        }
        if (this.mode === 'DEFERRED') await this.detectMode(ptr);
        if (this.mode !== 'BTREE') throw new Error("Operation requires a Map/Object context");

        const metaBuf = await this.db._readChainSafe(ptr);
        if (!metaBuf) throw new Error("Meta Block missing");
        
        const handlePtr = this._readPtr(metaBuf, 1);
        if (!handlePtr) throw new Error(`Invalid Handle Pointer in Meta Block.`);

        const handleBuf = await this.db._readChainSafe(handlePtr);
        if (!handleBuf) throw new Error("Handle Block missing");

        if (handleBuf.length < 4 || handleBuf.toString('utf8', 0, 4) !== "TREE") {
             throw new Error(`Invalid BTREE signature.`);
        }

        const rootPtr = this._readPtr(handleBuf, 4);
        if (!rootPtr) {
             return new BTree(this.db.allocator, null);
        }
        return new BTree(this.db.allocator, rootPtr);
    }

    async _updateTreePointer(ptr, tree) {
         if (this.mode === 'ROOT') {
            await this.db._writeRootPtrToSB(tree.rootPtr);
        } else {
            const metaBuf = await this.db._readChainSafe(ptr);
            const handlePtr = this._readPtr(metaBuf, 1);
            
            const newHandleBuf = Buffer.alloc(32); 
            newHandleBuf.write("TREE", 0);
            this._writePtr(newHandleBuf, 4, tree.rootPtr);
            await this.db._writeChainSafe(handlePtr, newHandleBuf);
        }
        if (this.db.allocator) await this.db.allocator.saveState();
    }

    async createMap(key) {
        return this.db.execute(async () => {
            this.log(`Creating Map "${key}"`);
            const ptr = await this.ptrPromise;
            await this.db.ensureOpen();
            const tree = await this._getCurrentTree(ptr);

            const newTree = new BTree(this.db.allocator);
            await newTree.getRoot(); 
            const newRootPtr = newTree.rootPtr;

            const handleBuf = Buffer.alloc(32); 
            handleBuf.write("TREE", 0);
            this._writePtr(handleBuf, 4, newRootPtr);
            const handlePtr = await this.db.allocator.allocate(32);
            await this.db.allocator.writeUserSpace(handlePtr, handleBuf);

            const metaBuf = Buffer.alloc(32); 
            metaBuf.writeUInt8(TYPE_BTREE, 0);
            this._writePtr(metaBuf, 1, handlePtr);
            const metaPtr = await this.db.allocator.allocate(32);
            await this.db.allocator.writeUserSpace(metaPtr, metaBuf);

            await tree.insert(key, metaPtr);
            await this._updateTreePointer(ptr, tree);
        });
    }

    async createList(key) {
        return this.db.execute(async () => {
            this.log(`Creating List "${key}"`);
            const ptr = await this.ptrPromise;
            await this.db.ensureOpen();
            const tree = await this._getCurrentTree(ptr);

            // 1. Alloc Header Block (Collection)
            const headerPtr = await this.db.allocator.allocatePage(constants.BLOCK_TYPE.COLLECTION_HEADER || 3);
            const col = new Collection(headerPtr.blockId, this.db.allocator);
            await col.saveHeader(); 
            
            // 2. Alloc Handle Block
            const handleBuf = Buffer.alloc(32);
            handleBuf.write("COLL", 0);
            this._writePtr(handleBuf, 4, { blockId: headerPtr.blockId, offset: 0, length: constants.BLOCK_SIZE, isChain: false });
            
            const handlePtr = await this.db.allocator.allocate(32);
            await this.db.allocator.writeUserSpace(handlePtr, handleBuf);

            // 3. Alloc Meta Block
            const metaBuf = Buffer.alloc(32); 
            metaBuf.writeUInt8(TYPE_COLLECTION, 0);
            this._writePtr(metaBuf, 1, handlePtr);
            
            const metaPtr = await this.db.allocator.allocate(32);
            await this.db.allocator.writeUserSpace(metaPtr, metaBuf);

            await tree.insert(key, metaPtr);
            await this._updateTreePointer(ptr, tree);
        });
    }

    async set(key, value) {
        this.log(`Set "${key}" requested.`);
        const ptr = await this.ptrPromise;
        await this.db.ensureOpen();
        const tree = await this._getCurrentTree(ptr);

        const metaPtr = await this.db._writeMetaValue(value);
        await tree.insert(key, metaPtr);

        await this._updateTreePointer(ptr, tree);
    }

    async delete(key) {
        const ptr = await this.ptrPromise;
        await this.db.ensureOpen();
        
        let tree;
        if (this.mode === 'ROOT') {
            tree = await this.db._loadRootTree();
            await tree.remove(key);
            await this.db._writeRootPtrToSB(tree.rootPtr);
        } else {
            if (this.mode === 'DEFERRED') await this.detectMode(ptr);
            if (this.mode !== 'BTREE') return false;

            const metaBuf = await this.db._readChainSafe(ptr);
            const handlePtr = this._readPtr(metaBuf, 1);
            const handleBuf = await this.db._readChainSafe(handlePtr);
            const rootPtr = this._readPtr(handleBuf, 4);
            tree = new BTree(this.db.allocator, rootPtr);
            
            await tree.remove(key);
            
            const newHandleBuf = Buffer.alloc(32); 
            newHandleBuf.write("TREE", 0);
            this._writePtr(newHandleBuf, 4, tree.rootPtr);
            await this.db._writeChainSafe(handlePtr, newHandleBuf);
        }
        return true;
    }

    async push(item) {
        return this.db.execute(async () => {
            this.log(`Push requested.`);
            const ptr = await this.ptrPromise;
            await this.db.ensureOpen();
            
            if (this.mode === 'DEFERRED') await this.detectMode(ptr);
            if (this.mode !== 'COLLECTION') throw new Error("Cannot push to non-collection");

            const metaBuf = await this.db._readChainSafe(ptr);
            const handlePtr = this._readPtr(metaBuf, 1);
            const handleBuf = await this.db._readChainSafe(handlePtr);
            
            if (handleBuf.length < 4 || handleBuf.toString('utf8', 0, 4) !== "COLL") {
                throw new Error(`Invalid Collection Handle Signature in push.`);
            }

            const headerPtr = this._readPtr(handleBuf, 4);
            const col = new Collection(headerPtr.blockId, this.db.allocator);
            await col.load();
            
            await col.append(Date.now().toString() + Math.random(), item);
            return true;
        });
    }

    async slice(start = 0, end = 100) {
        this.log(`Slice ${start}-${end} requested.`);
        const ptr = await this.ptrPromise;
        await this.db.ensureOpen();
        
        if (this.mode === 'DEFERRED') await this.detectMode(ptr);
        if (this.mode !== 'COLLECTION') {
            this.log("Slice called on non-collection.");
            return [];
        }

        const metaBuf = await this.db._readChainSafe(ptr);
        const handlePtr = this._readPtr(metaBuf, 1);
        const handleBuf = await this.db._readChainSafe(handlePtr);
        
        if (!handleBuf || handleBuf.length < 4 || handleBuf.toString('utf8', 0, 4) !== "COLL") {
            this.log("Invalid Collection Signature.");
            return [];
        }

        const headerPtr = this._readPtr(handleBuf, 4);
        if (!headerPtr || headerPtr.blockId === 0) {
             this.log("Invalid Header Pointer.");
             return [];
        }

        const col = new Collection(headerPtr.blockId, this.db.allocator);
        await col.load();
        
        this.log(`Collection Loaded. Head: ${col.headPageId}, Total: ${col.totalCount}`);

        const res = [];
        let currPage = col.headPageId;
        let count = 0;
        
        while(currPage !== 0 && count < end) {
            const page = new (require('../structure/page.js'))(currPage, this.db.allocator);
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
        // Iterator implementation similar to slice logic...
        const ptr = await this.ptrPromise;
        await this.db.ensureOpen();
        if (this.mode === 'DEFERRED') await this.detectMode(ptr);
        if (this.mode === 'COLLECTION') {
             const metaBuf = await this.db._readChainSafe(ptr);
             const handlePtr = this._readPtr(metaBuf, 1);
             const handleBuf = await this.db._readChainSafe(handlePtr);
             const headerPtr = this._readPtr(handleBuf, 4);
             const col = new Collection(headerPtr.blockId, this.db.allocator);
             await col.load();
             let currPage = col.headPageId;
             while(currPage !== 0) {
                const page = new (require('../structure/page.js'))(currPage, this.db.allocator);
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

module.exports = LiveHandle;