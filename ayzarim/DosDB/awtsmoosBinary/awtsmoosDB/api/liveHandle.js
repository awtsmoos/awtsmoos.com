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
                
                // 3. Inspection
                if (prop === 'constructor') return LiveHandle;
                if (prop === 'toString') return () => `[LiveHandle ${target.mode}]`;

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
                    const handlePtr = this.db._readPtrFromBuf(metaBuf, 1);
                    const handleBuf = await this.db._readChainSafe(handlePtr);
                    const rootPtr = this.db._readPtrFromBuf(handleBuf, 4);
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
     * Resolves this handle to a JS Value (Primitive or Plain Object).
     */
    async resolveSelf() {
        const ptr = await this.ptrPromise;
        if (!ptr && this.mode !== 'ROOT') return undefined;
        if (this.mode === 'ROOT') return "[AwtsmoosDB Root]";
        
        if (this.mode === 'DEFERRED') await this.detectMode(ptr);

        if (this.mode === 'BTREE') return "[AwtsmoosDB Object]";
        if (this.mode === 'COLLECTION') return "[AwtsmoosDB Collection]";
        
        // VALUE
        return await this.db._resolveValueFull(ptr);
    }

    async detectMode(ptr) {
        if (!ptr) { this.mode = 'VALUE'; return; }
        const metaBuf = await this.db._readChainSafe(ptr);
        if (!metaBuf) { this.mode = 'VALUE'; return; }
        const type = metaBuf.readUInt8(0);
        if (type === TYPE_BTREE) this.mode = 'BTREE';
        else if (type === TYPE_COLLECTION) this.mode = 'COLLECTION';
        else this.mode = 'VALUE';
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
        const handlePtr = this.db._readPtrFromBuf(metaBuf, 1);
        const handleBuf = await this.db._readChainSafe(handlePtr);
        const rootPtr = this.db._readPtrFromBuf(handleBuf, 4);
        return new BTree(this.db.allocator, rootPtr);
    }

    /**
     * Updates the parent pointer after a structural change (e.g. root split/move).
     */
    async _updateTreePointer(ptr, tree) {
         if (this.mode === 'ROOT') {
            await this.db._writeRootPtrToSB(tree.rootPtr);
        } else {
            const metaBuf = await this.db._readChainSafe(ptr);
            const handlePtr = this.db._readPtrFromBuf(metaBuf, 1);
            
            const newHandleBuf = Buffer.alloc(20);
            newHandleBuf.write("TREE", 0);
            this.db._writePtrToBuf(newHandleBuf, 4, tree.rootPtr);
            await this.db._writeChainSafe(handlePtr, newHandleBuf);
        }
    }

    /**
     * Creates a new Sub-Map (BTree) at the given key.
     */
    async createMap(key) {
        return this.db.execute(async () => {
            const ptr = await this.ptrPromise;
            await this.db.ensureOpen();
            const tree = await this._getCurrentTree(ptr);

            // 1. Create New BTree
            const newTree = new BTree(this.db.allocator);
            await newTree.getRoot(); // Initialize the root
            const newRootPtr = newTree.rootPtr;

            // 2. Create Handle for New Tree
            // [Type 4 "TREE"][RootPtr 15] -> 19 bytes used
            const handleBuf = Buffer.alloc(20);
            handleBuf.write("TREE", 0);
            this.db._writePtrToBuf(handleBuf, 4, newRootPtr);
            const handlePtr = await this.db.allocator.allocate(20);
            await this.db.allocator.writeUserSpace(handlePtr, handleBuf);

            // 3. Create Meta Pointer [Type 2 (BTREE)][HandlePtr 15]
            // Fixed: Buffer size must accommodate the full pointer (15 bytes) + type (1 byte)
            const metaBuf = Buffer.alloc(16);
            metaBuf.writeUInt8(TYPE_BTREE, 0);
            this.db._writePtrToBuf(metaBuf, 1, handlePtr);
            const metaPtr = await this.db.allocator.allocate(16);
            await this.db.allocator.writeUserSpace(metaPtr, metaBuf);

            // 4. Insert into Current Tree
            await tree.insert(key, metaPtr);
            
            // 5. Update Parent
            await this._updateTreePointer(ptr, tree);
        });
    }

    /**
     * Creates a new Collection (List) at the given key.
     */
    async createList(key) {
        return this.db.execute(async () => {
            const ptr = await this.ptrPromise;
            await this.db.ensureOpen();
            const tree = await this._getCurrentTree(ptr);

            // 1. Create Collection Header
            const headerPtr = await this.db.allocator.allocatePage(constants.BLOCK_TYPE.COLLECTION_HEADER || 3);
            const col = new Collection(headerPtr.blockId, this.db.allocator);
            await col.saveHeader();

            // 2. Create Handle for Collection
            // [Type "COLL"][HeaderPtr 15]
            const handleBuf = Buffer.alloc(20);
            handleBuf.write("COLL", 0);
            this.db._writePtrToBuf(handleBuf, 4, { blockId: headerPtr.blockId, offset: 0, length: constants.BLOCK_SIZE, isChain: false });
            const handlePtr = await this.db.allocator.allocate(20);
            await this.db.allocator.writeUserSpace(handlePtr, handleBuf);

            // 3. Create Meta Pointer [Type 3 (COLLECTION)][HandlePtr 15]
            // Fixed: Buffer size must accommodate the full pointer
            const metaBuf = Buffer.alloc(16);
            metaBuf.writeUInt8(TYPE_COLLECTION, 0);
            this.db._writePtrToBuf(metaBuf, 1, handlePtr);
            const metaPtr = await this.db.allocator.allocate(16);
            await this.db.allocator.writeUserSpace(metaPtr, metaBuf);

            // 4. Insert into Current Tree
            await tree.insert(key, metaPtr);

            // 5. Update Parent
            await this._updateTreePointer(ptr, tree);
        });
    }

    /**
     * Sets a property on the current BTree.
     */
    async set(key, value) {
        const ptr = await this.ptrPromise;
        await this.db.ensureOpen();
        const tree = await this._getCurrentTree(ptr);

        const metaPtr = await this.db._writeMetaValue(value);
        await tree.insert(key, metaPtr);

        await this._updateTreePointer(ptr, tree);
    }

    /**
     * Deletes a property.
     */
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
            const handlePtr = this.db._readPtrFromBuf(metaBuf, 1);
            const handleBuf = await this.db._readChainSafe(handlePtr);
            const rootPtr = this.db._readPtrFromBuf(handleBuf, 4);
            tree = new BTree(this.db.allocator, rootPtr);
            
            await tree.remove(key);
            
            // Update handle with new root
            const newHandleBuf = Buffer.alloc(20);
            newHandleBuf.write("TREE", 0);
            this.db._writePtrToBuf(newHandleBuf, 4, tree.rootPtr);
            await this.db._writeChainSafe(handlePtr, newHandleBuf);
        }
        return true;
    }

    /**
     * Collection: Push item
     */
    async push(item) {
        return this.db.execute(async () => {
            const ptr = await this.ptrPromise;
            await this.db.ensureOpen();
            
            if (this.mode === 'DEFERRED') await this.detectMode(ptr);
            if (this.mode !== 'COLLECTION') throw new Error("Cannot push to non-collection");

            const metaBuf = await this.db._readChainSafe(ptr);
            const dataPtr = this.db._readPtrFromBuf(metaBuf, 1);
            
            const col = new Collection(dataPtr.blockId, this.db.allocator);
            await col.load();
            
            await col.append(Date.now().toString() + Math.random(), item);
            return true;
        });
    }

    /**
     * Collection: Slice items
     */
    async slice(start = 0, end = 100) {
        const ptr = await this.ptrPromise;
        await this.db.ensureOpen();
        
        if (this.mode === 'DEFERRED') await this.detectMode(ptr);
        if (this.mode !== 'COLLECTION') return [];

        const metaBuf = await this.db._readChainSafe(ptr);
        const dataPtr = this.db._readPtrFromBuf(metaBuf, 1);
        
        const col = new Collection(dataPtr.blockId, this.db.allocator);
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

    /**
     * Async Iterator for streaming data
     */
    async *iterator() {
        const ptr = await this.ptrPromise;
        await this.db.ensureOpen();
        if (this.mode === 'DEFERRED') await this.detectMode(ptr);

        if (this.mode === 'COLLECTION') {
             const metaBuf = await this.db._readChainSafe(ptr);
             const dataPtr = this.db._readPtrFromBuf(metaBuf, 1);
             const col = new Collection(dataPtr.blockId, this.db.allocator);
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