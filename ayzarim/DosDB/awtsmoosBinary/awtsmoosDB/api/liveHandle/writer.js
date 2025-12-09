// B"H
const BTree = require('../../structure/btree.js');
const Collection = require('../../structure/collection.js');
const constants = require('../../constants.js');
const { writePointer48, readPointer48 } = require('../../utils/binaryHelpers.js');
const { _readPtr, _writePtr, TYPE_BTREE, TYPE_COLLECTION, SB_ROOT_PTR_OFFSET } = require('./utils.js');

class Writer {
    constructor(handle) {
        this.handle = handle;
        this.db = handle.db;
    }

    async createMap(key) {
        return this.db.execute(async () => {
            this.handle.log(`[Writer] Creating Map "${key}"`);
            const ptr = await this.handle.ptrPromise;
            await this.db.ensureOpen();
            const tree = await this.handle.tree.getCurrentTree(ptr);

            // B"H: For Replacement (CreateMap overwrites), we DO free the old root manually
            // because Ops.insert is not involved.
            const oldRoot = tree.rootPtr;
            this.handle.log(`[Writer] Old Root: ${oldRoot ? `${oldRoot.blockId}:${oldRoot.offset}` : 'NULL'}`);

            const newTree = new BTree(this.db.allocator);
            await newTree.getRoot(); 
            const newRootPtr = newTree.rootPtr;

            const handleBuf = Buffer.alloc(32); 
            handleBuf.write("TREE", 0);
            _writePtr(handleBuf, 4, newRootPtr);
            const handlePtr = await this.db.allocator.allocate(32);
            await this.db.allocator.writeUserSpace(handlePtr, handleBuf);

            const metaBuf = Buffer.alloc(32); 
            metaBuf.writeUInt8(TYPE_BTREE, 0);
            _writePtr(metaBuf, 1, handlePtr);
            const metaPtr = await this.db.allocator.allocate(32);
            await this.db.allocator.writeUserSpace(metaPtr, metaBuf);
            
            // B"H: Verify persistence immediately
            const verifyBuf = await this.db._readChainSafe(metaPtr);
            if (!verifyBuf || verifyBuf.readUInt8(0) !== TYPE_BTREE) {
                 throw new Error("Critical: Failed to persist Map Metadata.");
            }

            this.handle.log(`[Writer] Inserting key "${key}" into tree...`);
            await tree.insert(key, metaPtr);
            this.handle.log(`[Writer] Insert complete. New Root: ${tree.rootPtr.blockId}:${tree.rootPtr.offset}`);

            this.handle.log(`[Writer] Updating Tree Pointer...`);
            await this.handle.tree.updateTreePointer(ptr, tree);
            
            await this.verifyRootUpdate(ptr, tree.rootPtr);
            this.handle.log(`[Writer] Root Update Verified.`);

            // B"H: Transactional Free - Flush internal frees from Ops
            await tree.flushFrees();

            // B"H: Free old root only if it has a valid Block ID (i.e. not a fresh recovered root)
            if (oldRoot && oldRoot.blockId && tree.rootPtr && (oldRoot.blockId !== tree.rootPtr.blockId || oldRoot.offset !== tree.rootPtr.offset)) {
                 this.handle.log(`[Writer] Freeing Old Root ${oldRoot.blockId}:${oldRoot.offset}`);
                 await this.db.allocator.free(oldRoot);
            }
        });
    }

    async createList(key) {
        return this.db.execute(async () => {
            this.handle.log(`[Writer] Creating List "${key}"`);
            const ptr = await this.handle.ptrPromise;
            await this.db.ensureOpen();
            const tree = await this.handle.tree.getCurrentTree(ptr);
            
            const oldRoot = tree.rootPtr;
            this.handle.log(`[Writer] Old Root: ${oldRoot ? `${oldRoot.blockId}:${oldRoot.offset}` : 'NULL'}`);

            // 1. Alloc Header Block (Collection)
            const headerPtr = await this.db.allocator.allocatePage(constants.BLOCK_TYPE.COLLECTION_HEADER || 3);
            const col = new Collection(headerPtr.blockId, this.db.allocator);
            await col.saveHeader(); 
            
            // 2. Alloc Handle Block
            const handleBuf = Buffer.alloc(32);
            handleBuf.write("COLL", 0);
            _writePtr(handleBuf, 4, { blockId: headerPtr.blockId, offset: 0, length: constants.BLOCK_SIZE, isChain: false });
            
            const handlePtr = await this.db.allocator.allocate(32);
            await this.db.allocator.writeUserSpace(handlePtr, handleBuf);

            // 3. Alloc Meta Block
            const metaBuf = Buffer.alloc(32); 
            metaBuf.writeUInt8(TYPE_COLLECTION, 0);
            _writePtr(metaBuf, 1, handlePtr);
            
            const metaPtr = await this.db.allocator.allocate(32);
            await this.db.allocator.writeUserSpace(metaPtr, metaBuf);
            
            const verifyBuf = await this.db._readChainSafe(metaPtr);
            if (!verifyBuf || verifyBuf.readUInt8(0) !== TYPE_COLLECTION) {
                 throw new Error("Critical: Failed to persist List Metadata.");
            }

            await tree.insert(key, metaPtr);
            await this.handle.tree.updateTreePointer(ptr, tree);
            
            await this.verifyRootUpdate(ptr, tree.rootPtr);

            // B"H: Transactional Free - Flush internal frees from Ops
            await tree.flushFrees();

            if (oldRoot && oldRoot.blockId && tree.rootPtr && (oldRoot.blockId !== tree.rootPtr.blockId || oldRoot.offset !== tree.rootPtr.offset)) {
                 this.handle.log(`[Writer] Freeing Old Root ${oldRoot.blockId}:${oldRoot.offset}`);
                 await this.db.allocator.free(oldRoot);
            }
        });
    }

    async set(key, value) {
        this.handle.log(`Set "${key}" requested.`);
        const ptr = await this.handle.ptrPromise;
        await this.db.ensureOpen();
        const tree = await this.handle.tree.getCurrentTree(ptr);
        
        // B"H: Logic Change - Do NOT capture and free oldRoot manually here.
        // Ops.insert() will register the old root for freeing ONLY if it was rewritten.
        // If it was split, it will be kept.

        const metaPtr = await this.db._writeMetaValue(value);
        await tree.insert(key, metaPtr);

        await this.handle.tree.updateTreePointer(ptr, tree);
        
        await this.verifyRootUpdate(ptr, tree.rootPtr);

        // B"H: Transactional Free - Flush internal frees from Ops (which now includes Old Root if valid)
        await tree.flushFrees();
    }

    async delete(key) {
        const ptr = await this.handle.ptrPromise;
        await this.db.ensureOpen();
        
        let tree;
        if (this.handle.mode === 'ROOT') {
            tree = await this.db._loadRootTree();
            // B"H: Removed manual oldRoot free logic. Delegated to Ops + flushFrees.
            
            await tree.remove(key);
            
            await this.handle.tree.updateTreePointer(ptr, tree);
            await this.verifyRootUpdate(ptr, tree.rootPtr); 

            await tree.flushFrees();
            
        } else {
            if (this.handle.mode === 'DEFERRED') await this.handle.nav.detectMode(ptr);
            if (this.handle.mode !== 'BTREE') return false;

            const metaBuf = await this.db._readChainSafe(ptr);
            const handlePtr = _readPtr(metaBuf, 1);
            const handleBuf = await this.db._readChainSafe(handlePtr);
            const rootPtr = _readPtr(handleBuf, 4);
            tree = new BTree(this.db.allocator, rootPtr);
            
            // B"H: Removed manual oldRoot free logic. Delegated to Ops + flushFrees.
            
            await tree.remove(key);
            
            const newHandleBuf = Buffer.alloc(32); 
            newHandleBuf.write("TREE", 0);
            _writePtr(newHandleBuf, 4, tree.rootPtr);
            await this.db._writeChainSafe(handlePtr, newHandleBuf);
            if (this.db.allocator) await this.db.allocator.saveState();

            // Verification
            const checkBuf = await this.db._readChainSafe(handlePtr);
            const checkRoot = _readPtr(checkBuf, 4);
            if (!checkRoot || checkRoot.blockId !== tree.rootPtr.blockId || checkRoot.offset !== tree.rootPtr.offset) {
                 throw new Error("B\"H: Critical - Delete failed to persist new root pointer.");
            }

            await tree.flushFrees();
        }
        return true;
    }

    async push(item) {
        return this.db.execute(async () => {
            this.handle.log(`Push requested.`);
            const ptr = await this.handle.ptrPromise;
            await this.db.ensureOpen();
            
            if (this.handle.mode === 'DEFERRED') await this.handle.nav.detectMode(ptr);
            
            if (this.handle.mode !== 'COLLECTION') {
                 await this.handle.nav.detectMode(ptr);
                 if (this.handle.mode !== 'COLLECTION') {
                    throw new Error(`Cannot push to non-collection. Mode: ${this.handle.mode}`);
                 }
            }

            const metaBuf = await this.db._readChainSafe(ptr);
            const handlePtr = _readPtr(metaBuf, 1);
            const handleBuf = await this.db._readChainSafe(handlePtr);
            
            if (handleBuf.length < 4 || handleBuf.toString('utf8', 0, 4) !== "COLL") {
                throw new Error(`Invalid Collection Handle Signature in push.`);
            }

            const headerPtr = _readPtr(handleBuf, 4);
            const col = new Collection(headerPtr.blockId, this.db.allocator);
            await col.load();
            
            // Random key for uniqueness in page structure
            await col.append(Date.now().toString(36) + Math.random().toString(36).substr(2, 5), item);
            return true;
        });
    }

    // B"H: Splice Method
    async splice(start, deleteCount, ...items) {
        return this.db.execute(async () => {
             this.handle.log(`Splice requested at ${start}.`);
             const ptr = await this.handle.ptrPromise;
             await this.db.ensureOpen();

             if (this.handle.mode === 'DEFERRED') await this.handle.nav.detectMode(ptr);
             if (this.handle.mode !== 'COLLECTION') {
                 throw new Error(`Cannot splice non-collection. Mode: ${this.handle.mode}`);
             }

             const metaBuf = await this.db._readChainSafe(ptr);
             const handlePtr = _readPtr(metaBuf, 1);
             const handleBuf = await this.db._readChainSafe(handlePtr);
             const headerPtr = _readPtr(handleBuf, 4);
             
             const col = new Collection(headerPtr.blockId, this.db.allocator);
             await col.load();
             
             await col.splice(start, deleteCount, ...items);
             return true;
        });
    }

    // B"H: Helper to read back the handle and ensure it points to the new root
    async verifyRootUpdate(ptr, expectedRoot) {
        if (this.handle.mode === 'ROOT') {
             // B"H: Verify SuperBlock directly.
             const sb = await this.db.allocator.pager.readBlock(0);
             if (!sb) throw new Error("B\"H: Verification Failed - SuperBlock read failed.");
             
             const rootId = readPointer48(sb, SB_ROOT_PTR_OFFSET);
             const rootOff = sb.readUInt32BE(SB_ROOT_PTR_OFFSET + 6);
             
             if (rootId !== expectedRoot.blockId || rootOff !== expectedRoot.offset) {
                 throw new Error(`B"H: ROOT Verification Failed. SB points to ${rootId}:${rootOff}, expected ${expectedRoot.blockId}:${expectedRoot.offset}`);
             }
             return; 
        }

        const metaBuf = await this.db._readChainSafe(ptr);
        const handlePtr = _readPtr(metaBuf, 1);
        const handleBuf = await this.db._readChainSafe(handlePtr);
        
        if (!handleBuf || handleBuf.toString('utf8', 0, 4) !== "TREE") {
             throw new Error("B\"H: Verification Failed - Handle corrupted or invalid type.");
        }
        const savedRoot = _readPtr(handleBuf, 4);
        
        if (!savedRoot) {
             if (expectedRoot) throw new Error("B\"H: Verification Failed - Saved root is null but expected valid.");
             return;
        }
        
        if (savedRoot.blockId !== expectedRoot.blockId || savedRoot.offset !== expectedRoot.offset) {
             throw new Error(`B"H: Verification Failed - Root mismatch. Saved: ${savedRoot.blockId}:${savedRoot.offset}, Expected: ${expectedRoot.blockId}:${expectedRoot.offset}`);
        }
    }
}

module.exports = Writer;