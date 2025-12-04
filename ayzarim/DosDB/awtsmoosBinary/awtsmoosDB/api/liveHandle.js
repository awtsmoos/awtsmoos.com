// B"H
/**
 * @file liveHandle.js
 * @description
 *  The Yadayim (Hands) of the Database.
 *  Handles the chaining of potentiality (Promises) into actuality (Values).
 *  Acts as a Vessel (Kli) that proxies the Light of the Data.
 */

const BTree = require('../structure/btree.js');
const Collection = require('../structure/collection.js');
const parser = require('../deserialize/parser.js');
const v1Adapter = require('../deserialize/v1_adapter.js');
const constants = require('../constants.js');
const { writePointer48, readPointer48 } = require('../utils/binaryHelpers.js');
const serializer = require('../utils/serializer.js');

// Redefine constants to avoid circular import runtime issues
const TYPE_RAW = 1;
const TYPE_BTREE = 2;
const TYPE_COLLECTION = 3;

class LiveHandle {
    /**
     * @param {Object} db - The AwtsmoosDB Instance
     * @param {Promise<Object>} ptrPromise - Resolves to the MetaBlock Ptr {blockId, offset, length, isChain}
     * @param {string} mode - 'ROOT', 'BTREE', 'COLLECTION', 'VALUE', 'DEFERRED'
     */
    constructor(db, ptrPromise, mode = 'VALUE') {
        this.db = db;
        this.ptrPromise = ptrPromise;
        this.mode = mode;

        return new Proxy(this, {
            get: (target, prop) => {
                // 1. Promise Interface (Thenable)
                if (prop === 'then') return (res, rej) => target.resolveSelf().then(res, rej);
                if (prop === 'catch') return (cb) => target.resolveSelf().catch(cb);
                if (prop === 'finally') return (cb) => target.resolveSelf().finally(cb);
                
                // 2. Iterator
                if (prop === Symbol.asyncIterator) return target.iterator.bind(target);
                
                // 3. Inspection / Serialization
                if (prop === 'constructor') return LiveHandle;
                if (prop === 'toString') return () => `[LiveHandle ${target.mode}]`;
                if (prop === 'toJSON') return target.toJSON.bind(target);

                // 4. Collection/Mutation Methods
                if (prop === 'push') return target.push.bind(target);
                if (prop === 'slice') return target.slice.bind(target);
                if (prop === 'delete' || prop === 'deleteProperty') return target.delete.bind(target);
                
                // 5. Structure Creation
                if (prop === 'createMap') return target.createMap.bind(target);
                if (prop === 'createList') return target.createList.bind(target);

                // 6. Chain Navigation
                return target.navigate(prop);
            },
            set: (target, prop, value) => {
                // Fire and forget write via execution queue
                target.db.execute(() => target.set(prop, value))
                    .catch(e => console.error(`[LiveHandle] Set Error on ${prop}:`, e));
                return true; 
            },
            deleteProperty: (target, prop) => {
                // Trap for `delete db.path.prop`
                target.db.execute(() => target.delete(prop))
                    .catch(e => console.error(`[LiveHandle] Delete Error on ${prop}:`, e));
                return true;
            }
        });
    }

    /**
     * Helper: Writes a pointer structure to a buffer at specific offset.
     * Uses FIXED WIDTH (4 byte) integers for Offset and Length to ensure consistency.
     * Total Size: 6 (Block) + 4 (Off) + 4 (Len) + 1 (Chain) = 15 bytes.
     */
    _writePtr(buf, offset, ptr) {
        if (!ptr) throw new Error("B\"H: Cannot write null pointer");
        if (offset + 15 > buf.length) throw new Error("B\"H: Buffer overflow in _writePtr (Total Size)");
        
        writePointer48(buf, ptr.blockId, offset);
        
        // Use Fixed UInt32BE for robustness
        buf.writeUInt32BE(ptr.offset, offset + 6);
        buf.writeUInt32BE(ptr.length, offset + 10);
        
        buf.writeUInt8(ptr.isChain ? 1 : 0, offset + 14);
    }

    /**
     * Helper: Reads a pointer structure from a buffer at specific offset.
     * Uses FIXED WIDTH (4 byte) integers.
     */
    _readPtr(buf, offset) {
        if (!buf || offset >= buf.length) return null;
        if (offset + 15 > buf.length) return null; // Safety for 15-byte read

        const blockId = readPointer48(buf, offset);
        
        // Read Fixed UInt32BE
        const o = buf.readUInt32BE(offset + 6);
        const l = buf.readUInt32BE(offset + 10);
        
        const c = buf.readUInt8(offset + 14);
        
        // B"H: FIX - Treat 0-length pointers as null/invalid in this context.
        if (l === 0) return null;

        // Standard null check
        if (blockId === 0 && o === 0) return null;

        return { blockId, offset: o, length: l, isChain: c === 1 };
    }

    /**
     * Navigate deeper into the Tree.
     * Returns a new LiveHandle representing the child.
     */
    navigate(key) {
        const nextPromise = this.ptrPromise.then(async (ptr) => {
            await this.db.ensureOpen();
            let tree;

            if (this.mode === 'ROOT') {
                tree = await this.db._loadRootTree();
            } else {
                // Determine container type if deferred
                if (this.mode === 'DEFERRED') await this.detectMode(ptr);
                
                if (this.mode === 'BTREE') {
                    if (!ptr) return null;
                    const metaBuf = await this.db._readChainSafe(ptr);
                    if (!metaBuf) return null; 

                    // Use local _readPtr
                    const handlePtr = this._readPtr(metaBuf, 1);
                    if (!handlePtr) return null;

                    const handleBuf = await this.db._readChainSafe(handlePtr);
                    if (!handleBuf) return null; 

                    // B"H: Validate "TREE" signature
                    if (handleBuf.length < 4 || handleBuf.toString('utf8', 0, 4) !== "TREE") {
                        return null;
                    }

                    // Use local _readPtr (Offset 4 for "TREE")
                    const rootPtr = this._readPtr(handleBuf, 4);
                    tree = new BTree(this.db.allocator, rootPtr);
                } else {
                    return null; // Values/Collections don't have keyed children
                }
            }

            return await tree.search(key);
        });

        // We don't know the child type yet, so DEFERRED
        return new LiveHandle(this.db, nextPromise, 'DEFERRED');
    }

    /**
     * Resolves this handle to a JS Value.
     */
    async resolveSelf() {
        const ptr = await this.ptrPromise;
        if (!ptr && this.mode !== 'ROOT') return undefined;
        if (this.mode === 'ROOT') return "[AwtsmoosDB Root]";
        
        if (this.mode === 'DEFERRED') await this.detectMode(ptr);

        if (this.mode === 'BTREE' || this.mode === 'COLLECTION') {
            return this.toJSON();
        }
        
        // VALUE
        return await this.db._resolveValueFull(ptr);
    }

    async detectMode(ptr) {
        if (!ptr) { this.mode = 'VALUE'; return; }
        const metaBuf = await this.db._readChainSafe(ptr);
        if (!metaBuf) { this.mode = 'VALUE'; return; }
        const type = metaBuf.length > 0 ? metaBuf.readUInt8(0) : 0;
        
        if (type === TYPE_BTREE) this.mode = 'BTREE';
        else if (type === TYPE_COLLECTION) this.mode = 'COLLECTION';
        else this.mode = 'VALUE';
    }

    /**
     * Converts the current handle's data to a JSON-compatible JS object/array.
     */
    async toJSON(depth = 0) {
        if (depth > 5) return "[Max Depth Exceeded]";
        
        try {
            const ptr = await this.ptrPromise;
            if (!ptr) return undefined;
            
            if (this.mode === 'DEFERRED') await this.detectMode(ptr);
            
            if (this.mode === 'BTREE') {
                const tree = await this._getCurrentTree(ptr);
                // Get all keys (limit to prevent explosion)
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
        } catch (e) {
            console.warn("B\"H: toJSON Error:", e.message);
            return { error: "Failed to resolve structure" };
        }
    }

    /**
     * Helper to get the underlying BTree of the current handle.
     */
    async _getCurrentTree(ptr) {
        if (this.mode === 'ROOT') {
            return await this.db._loadRootTree();
        }
        if (this.mode === 'DEFERRED') await this.detectMode(ptr);
        if (this.mode !== 'BTREE') throw new Error("Operation requires a Map/Object context");

        const metaBuf = await this.db._readChainSafe(ptr);
        if (!metaBuf) throw new Error("Meta Block missing");
        
        const handlePtr = this._readPtr(metaBuf, 1);
        if (!handlePtr) {
             const hex = metaBuf.toString('hex');
             throw new Error(`Invalid Handle Pointer in Meta Block. Dump: ${hex}`);
        }

        const handleBuf = await this.db._readChainSafe(handlePtr);
        if (!handleBuf) throw new Error("Handle Block missing");

        // B"H: Strict Signature Verification
        if (handleBuf.length < 4 || handleBuf.toString('utf8', 0, 4) !== "TREE") {
             const hex = handleBuf ? handleBuf.subarray(0, Math.min(32, handleBuf.length)).toString('hex') : "null";
             const len = handleBuf ? handleBuf.length : 0;
             throw new Error(`Invalid BTREE signature. Len: ${len}. Got: ${hex}`);
        }

        const rootPtr = this._readPtr(handleBuf, 4);
        if (!rootPtr) {
             return new BTree(this.db.allocator, null);
        }
        return new BTree(this.db.allocator, rootPtr);
    }

    /**
     * Updates the parent pointer after a structural change.
     */
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
        // FORCE SAVE STATE
        if (this.db.allocator) await this.db.allocator.saveState();
        if (this.db.pager && this.db.pager.handle) await this.db.pager.handle.sync();
    }

    async createMap(key) {
        return this.db.execute(async () => {
            const ptr = await this.ptrPromise;
            await this.db.ensureOpen();
            const tree = await this._getCurrentTree(ptr);

            const newTree = new BTree(this.db.allocator);
            await newTree.getRoot(); 
            const newRootPtr = newTree.rootPtr;

            // 1. Create Handle Block
            // "TREE" (4) + Ptr (15) = 19 bytes. Fits in 32.
            const handleBuf = Buffer.alloc(32); 
            handleBuf.write("TREE", 0);
            this._writePtr(handleBuf, 4, newRootPtr);
            const handlePtr = await this.db.allocator.allocate(32);
            await this.db.allocator.writeUserSpace(handlePtr, handleBuf);

            // 2. Create Meta Block
            const metaBuf = Buffer.alloc(32); 
            metaBuf.writeUInt8(TYPE_BTREE, 0);
            this._writePtr(metaBuf, 1, handlePtr);
            const metaPtr = await this.db.allocator.allocate(32);
            await this.db.allocator.writeUserSpace(metaPtr, metaBuf);

            await tree.insert(key, metaPtr);
            await this._updateTreePointer(ptr, tree);
            
            // B"H: Paranoid Persistence
            if (this.db.allocator) await this.db.allocator.saveState();
            if (this.db.pager && this.db.pager.handle) await this.db.pager.handle.sync();
        });
    }

    async createList(key) {
        return this.db.execute(async () => {
            const ptr = await this.ptrPromise;
            await this.db.ensureOpen();
            const tree = await this._getCurrentTree(ptr);

            // 1. Alloc Header Block (Collection)
            const headerPtr = await this.db.allocator.allocatePage(constants.BLOCK_TYPE.COLLECTION_HEADER || 3);
            const col = new Collection(headerPtr.blockId, this.db.allocator);
            await col.saveHeader(); 
            
            // 2. Alloc Handle Block (Data pointing to Header)
            const handleBuf = Buffer.alloc(32);
            handleBuf.write("COLL", 0);
            
            this._writePtr(handleBuf, 4, { blockId: headerPtr.blockId, offset: 0, length: constants.BLOCK_SIZE, isChain: false });
            
            const handlePtr = await this.db.allocator.allocate(32);
            await this.db.allocator.writeUserSpace(handlePtr, handleBuf);

            // B"H: VERIFY WRITE IMMEDIATELY & SYNC
            if (this.db.allocator) await this.db.allocator.saveState();
            if (this.db.pager && this.db.pager.handle) await this.db.pager.handle.sync();

            const verifyBuf = await this.db._readChainSafe(handlePtr);
            if (!verifyBuf || verifyBuf.toString('utf8', 0, 4) !== "COLL") {
                 throw new Error("B\"H: Fatal - Write Verification Failed in createList.");
            }

            // 3. Alloc Meta Block (Pointing to Handle)
            const metaBuf = Buffer.alloc(32); 
            metaBuf.writeUInt8(TYPE_COLLECTION, 0);
            this._writePtr(metaBuf, 1, handlePtr);
            
            const metaPtr = await this.db.allocator.allocate(32);
            await this.db.allocator.writeUserSpace(metaPtr, metaBuf);

            // 4. Insert into Tree
            await tree.insert(key, metaPtr);
            await this._updateTreePointer(ptr, tree);

            // B"H: Paranoid Persistence to ensure cursor & data survival
            if (this.db.allocator) await this.db.allocator.saveState();
            if (this.db.pager && this.db.pager.handle) await this.db.pager.handle.sync();
        });
    }

    async set(key, value) {
        const ptr = await this.ptrPromise;
        await this.db.ensureOpen();
        const tree = await this._getCurrentTree(ptr);

        const metaPtr = await this.db._writeMetaValue(value);
        await tree.insert(key, metaPtr);

        await this._updateTreePointer(ptr, tree);
        
        // FORCE SAVE
        if (this.db.allocator) await this.db.allocator.saveState();
        if (this.db.pager && this.db.pager.handle) await this.db.pager.handle.sync();
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
            if (!metaBuf) return false;

            const handlePtr = this._readPtr(metaBuf, 1);
            const handleBuf = await this.db._readChainSafe(handlePtr);
            if (!handleBuf) return false;

            const rootPtr = this._readPtr(handleBuf, 4);
            tree = new BTree(this.db.allocator, rootPtr);
            
            await tree.remove(key);
            
            const newHandleBuf = Buffer.alloc(32); 
            newHandleBuf.write("TREE", 0);
            this._writePtr(newHandleBuf, 4, tree.rootPtr);
            await this.db._writeChainSafe(handlePtr, newHandleBuf);
        }
        
        // FORCE SAVE
        if (this.db.allocator) await this.db.allocator.saveState();
        if (this.db.pager && this.db.pager.handle) await this.db.pager.handle.sync();
        
        return true;
    }

    async push(item) {
        return this.db.execute(async () => {
            const ptr = await this.ptrPromise;
            await this.db.ensureOpen();
            
            if (this.mode === 'DEFERRED') await this.detectMode(ptr);
            if (this.mode !== 'COLLECTION') throw new Error("Cannot push to non-collection");

            const metaBuf = await this.db._readChainSafe(ptr);
            if (!metaBuf) throw new Error("Meta Block missing in push");
            
            const handlePtr = this._readPtr(metaBuf, 1);
            const handleBuf = await this.db._readChainSafe(handlePtr);
            if (!handleBuf) throw new Error("Handle Block missing in push");
            
            if (handleBuf.length < 4 || handleBuf.toString('utf8', 0, 4) !== "COLL") {
                const hex = handleBuf ? handleBuf.subarray(0, Math.min(32, handleBuf.length)).toString('hex') : "null";
                throw new Error(`Invalid Collection Handle Signature in push. Got: ${hex}`);
            }

            const headerPtr = this._readPtr(handleBuf, 4);
            const col = new Collection(headerPtr.blockId, this.db.allocator);
            await col.load();
            
            await col.append(Date.now().toString() + Math.random(), item);
            
            // FORCE SAVE
            if (this.db.allocator) await this.db.allocator.saveState();
            if (this.db.pager && this.db.pager.handle) await this.db.pager.handle.sync();
            
            return true;
        });
    }

    async slice(start = 0, end = 100) {
        const ptr = await this.ptrPromise;
        await this.db.ensureOpen();
        
        if (this.mode === 'DEFERRED') await this.detectMode(ptr);
        if (this.mode !== 'COLLECTION') return [];

        const metaBuf = await this.db._readChainSafe(ptr);
        if (!metaBuf) return [];

        const handlePtr = this._readPtr(metaBuf, 1);
        const handleBuf = await this.db._readChainSafe(handlePtr);
        
        // B"H: Debugging Info on Corruption
        if (!handleBuf) {
            console.warn("B\"H: Slice - Missing Handle Buffer");
            return [];
        }

        if (handleBuf.length < 4 || handleBuf.toString('utf8', 0, 4) !== "COLL") {
            const hex = handleBuf ? handleBuf.subarray(0, Math.min(32, handleBuf.length)).toString('hex') : "null";
            console.warn(`B\"H: Slice - Invalid Collection Signature in Handle. Got: ${hex}`);
            // Return empty instead of throwing to avoid crash, but log error.
            return [];
        }

        const headerPtr = this._readPtr(handleBuf, 4);
        if (!headerPtr || headerPtr.blockId === 0) {
             console.warn("B\"H: Slice - Invalid Header Pointer");
             return [];
        }

        const col = new Collection(headerPtr.blockId, this.db.allocator);
        await col.load();
        
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
        const ptr = await this.ptrPromise;
        await this.db.ensureOpen();
        if (this.mode === 'DEFERRED') await this.detectMode(ptr);

        if (this.mode === 'COLLECTION') {
             const metaBuf = await this.db._readChainSafe(ptr);
             if (!metaBuf) return;

             const handlePtr = this._readPtr(metaBuf, 1);
             const handleBuf = await this.db._readChainSafe(handlePtr);
             if (!handleBuf) return;

             if (handleBuf.length < 4 || handleBuf.toString('utf8', 0, 4) !== "COLL") return;

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