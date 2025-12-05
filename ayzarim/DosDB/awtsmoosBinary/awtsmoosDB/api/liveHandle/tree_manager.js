// B"H
const BTree = require('../../structure/btree.js');
const { _readPtr, _writePtr, SB_ROOT_PTR_OFFSET } = require('./utils.js');
const { writePointer48, readPointer48 } = require('../../utils/binaryHelpers.js');

class TreeManager {
    constructor(handle) {
        this.handle = handle;
        this.db = handle.db;
    }

    async getCurrentTree(ptr) {
        if (this.handle.mode === 'ROOT') {
            // B"H: Bypass db._loadRootTree() to ensure fresh SuperBlock state.
            // This prevents using a stale BTree instance cached by the DB object.
            const sb = await this.db.allocator.pager.readBlock(0);
            if (!sb) throw new Error("B\"H: Critical - SuperBlock read failed in TreeManager.");

            const rootId = readPointer48(sb, SB_ROOT_PTR_OFFSET);
            const rootOff = sb.readUInt32BE(SB_ROOT_PTR_OFFSET + 6);
            const rootLen = sb.readUInt32BE(SB_ROOT_PTR_OFFSET + 10);
            const isChain = sb.readUInt8(SB_ROOT_PTR_OFFSET + 14) === 1;

            let rootPtr = null;
            if (rootId !== 0 || rootOff !== 0) {
                rootPtr = { blockId: rootId, offset: rootOff, length: rootLen, isChain };
            }
            return new BTree(this.db.allocator, rootPtr);
        }
        if (this.handle.mode === 'DEFERRED') await this.handle.nav.detectMode(ptr);
        if (this.handle.mode !== 'BTREE') throw new Error("Operation requires a Map/Object context");

        const metaBuf = await this.db._readChainSafe(ptr);
        if (!metaBuf) throw new Error("Meta Block missing");
        
        const handlePtr = _readPtr(metaBuf, 1);
        if (!handlePtr) throw new Error(`Invalid Handle Pointer in Meta Block.`);

        const handleBuf = await this.db._readChainSafe(handlePtr);
        if (!handleBuf) throw new Error("Handle Block missing");

        if (handleBuf.length < 4 || handleBuf.toString('utf8', 0, 4) !== "TREE") {
             throw new Error(`Invalid BTREE signature.`);
        }

        const rootPtr = _readPtr(handleBuf, 4);
        if (!rootPtr) {
             // B"H: If root is null, create a temp tree wrapper.
             // Ops will create the root on insert.
             return new BTree(this.db.allocator, null);
        }
        return new BTree(this.db.allocator, rootPtr);
    }

    async updateTreePointer(ptr, tree) {
         if (this.handle.mode === 'ROOT') {
            // B"H: Atomic Root Pointer Update via Allocator.
            // We pass a modifier function to updateSuperBlock which runs inside the lock.
            await this.db.allocator.updateSuperBlock((sb) => {
                 writePointer48(sb, tree.rootPtr.blockId, SB_ROOT_PTR_OFFSET);
                 sb.writeUInt32BE(tree.rootPtr.offset, SB_ROOT_PTR_OFFSET + 6);
                 sb.writeUInt32BE(tree.rootPtr.length, SB_ROOT_PTR_OFFSET + 10);
                 sb.writeUInt8(tree.rootPtr.isChain ? 1 : 0, SB_ROOT_PTR_OFFSET + 14);
            });
        } else {
            const metaBuf = await this.db._readChainSafe(ptr);
            const handlePtr = _readPtr(metaBuf, 1);
            
            const newHandleBuf = Buffer.alloc(32); 
            newHandleBuf.write("TREE", 0);
            _writePtr(newHandleBuf, 4, tree.rootPtr);
            await this.db._writeChainSafe(handlePtr, newHandleBuf);
            // B"H: Ensure allocator state (cursor) is synced to disk
            if (this.db.allocator) await this.db.allocator.saveState();
        }
    }
}

module.exports = TreeManager;