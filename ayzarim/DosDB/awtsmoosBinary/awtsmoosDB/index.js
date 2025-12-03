// B"H
/**
 * @file index.js
 * @description
 *  The Keter (Crown) of the Database.
 *  Here lies the Infinite Light (Or Ein Sof) wrapped in the
 *  Vessels (Kelim) of the File System.
 *  
 *  This entry point unifies the 10 Sefirot of Binary Storage
 *  into a single, unified Divine Name: AwtsmoosDB.
 */

const Pager = require('./core/pager.js');
const Allocator = require('./core/allocator.js');
const BTree = require('./structure/btree.js');
const Collection = require('./structure/collection.js');
const LiveHandle = require('./api/liveHandle.js');
const serializeValue = require('./serialize/serializeValue.js');
const parser = require('./deserialize/parser.js');
const v1Adapter = require('./deserialize/v1_adapter.js');
const constants = require('./constants.js');
const { writePointer48, readPointer48 } = require('./utils/binaryHelpers.js');

// --- PATCH CONSTANTS FOR SAFETY ---
// We must ensure BLOCK_TYPE definitions exist to prevent the Allocator
// from treating critical pages as "Free" (Type 0).
if (!constants.BLOCK_TYPE) constants.BLOCK_TYPE = {};
if (!constants.BLOCK_TYPE.FREE) constants.BLOCK_TYPE.FREE = 0;
if (!constants.BLOCK_TYPE.PAGE) constants.BLOCK_TYPE.PAGE = 1;
// Ensure Collection types are non-zero!
if (!constants.BLOCK_TYPE.COLLECTION_PAGE) constants.BLOCK_TYPE.COLLECTION_PAGE = 3;
if (!constants.BLOCK_TYPE.COLLECTION_HEADER) constants.BLOCK_TYPE.COLLECTION_HEADER = 4;
if (!constants.BLOCK_TYPE.OVERFLOW) constants.BLOCK_TYPE.OVERFLOW = 5;


// --- Mystical Constants of the Meta-Structure ---
const TYPE_RAW = 1;        // Earth (Malchut) - Simple Value
const TYPE_BTREE = 2;      // Air (Zeir Anpin) - Nested Tree
const TYPE_COLLECTION = 3; // Water (Binah) - Flowing Stream

const OFFSET_ROOT_PTR = 64; // The Seat of the Root in SuperBlock

class AwtsmoosDB {
    /**
     * @param {string} filePath - Path to the physical vessel.
     */
    constructor(filePath) {
        this.filePath = filePath;
        this.pager = new Pager(filePath);
        this.allocator = new Allocator(this.pager);
        this.isOpen = false;
        
        // The Sefira of Order (Execution Queue)
        // Ensures writes happen sequentially to prevent race conditions
        this.opQueue = Promise.resolve();
        
        // The Root Proxy (Keter)
        this._rootHandle = new LiveHandle(this, Promise.resolve(null), 'ROOT');
    }

    /**
     * Access the Divine Interface (Live Handle).
     */
    get root() {
        return this._rootHandle;
    }

    /**
     * Opens the Gates of Wisdom (Initializes DB).
     */
    async open() {
        if (this.isOpen) return;
        
        await this.pager.init();
        
        // Genesis Check
        const sb = await this.pager.readBlock(0);
        if (!sb || sb.length === 0 || sb[0] === 0) {
            await this._genesis();
        } else {
            // Restore the Cursor of Creation
            const cursor = readPointer48(sb, 16); 
            if (cursor > 2) {
                this.allocator.cursor = cursor;
                this.allocator.lastFreeHint = cursor;
            }
        }
        this.isOpen = true;
    }

    /**
     * Closes the Gates (Cleanup).
     */
    async close() {
        if (this.isOpen) {
            await this.waitForIdle();
            await this.allocator.saveState();
            await this.pager.close();
            this.isOpen = false;
        }
    }

    /**
     * Queue an operation to be executed in divine order.
     * @param {Function} task - Async function to execute
     * @returns {Promise}
     */
    execute(task) {
        const wrappedTask = async () => {
            await this.ensureOpen();
            return task();
        };
        // Chain the task, ensuring errors don't break the chain for future tasks
        this.opQueue = this.opQueue.then(wrappedTask, wrappedTask);
        return this.opQueue;
    }

    /**
     * Waits for all pending operations (Sefirot) to align/complete.
     */
    async waitForIdle() {
        try {
            await this.opQueue;
        } catch (e) {
            // Ignore errors in idle wait
        }
    }

    /**
     * Retrives a Spark (Value) by its Name.
     * @param {string} key 
     */
    async get(key) {
        await this.ensureOpen();
        const tree = await this._loadRootTree();
        const ptr = await tree.search(key);
        if (!ptr) return undefined;
        return await this._resolveValueFull(ptr);
    }

    /**
     * Inscribes a Truth (Value) into the Firmament.
     * @param {string} key 
     * @param {any} value 
     */
    async set(key, value) {
        return this.execute(async () => {
            const tree = await this._loadRootTree();
            const metaPtr = await this._writeMetaValue(value);
            await tree.insert(key, metaPtr);
            await this._writeRootPtrToSB(tree.rootPtr);
            return true;
        });
    }

    /**
     * Erases a Name from the Book.
     * @param {string} key 
     */
    async delete(key) {
        return this.execute(async () => {
            const tree = await this._loadRootTree();
            await tree.remove(key);
            await this._writeRootPtrToSB(tree.rootPtr);
            return true;
        });
    }

    async ensureOpen() {
        if (!this.isOpen) await this.open();
    }

    // ==========================================
    //  INTERNAL ALCHEMY
    // ==========================================

    async _genesis() {
        const sb = Buffer.alloc(4096);
        sb.write("AwtsmoosDB_V1", 0);
        writePointer48(sb, 2, 16); 
        await this.pager.writeBlock(0, sb);

        const tree = new BTree(this.allocator);
        const rootPtr = await tree.saveNode({ isLeaf: true, keys: [], values: [], children: [], count: 0 });
        await this._writeRootPtrToSB(rootPtr);
    }

    async _loadRootTree() {
        const rootPtr = await this._readRootPtrFromSB();
        return new BTree(this.allocator, rootPtr);
    }

    async _readRootPtrFromSB() {
        const sb = await this.pager.readBlock(0);
        const b = readPointer48(sb, OFFSET_ROOT_PTR);
        const o = sb.readUInt32BE(OFFSET_ROOT_PTR + 6);
        const l = sb.readUInt32BE(OFFSET_ROOT_PTR + 10);
        const c = sb.readUInt8(OFFSET_ROOT_PTR + 14);
        return { blockId: b, offset: o, length: l, isChain: c === 1 };
    }

    async _writeRootPtrToSB(ptr) {
        const sb = await this.pager.readBlock(0);
        writePointer48(sb, ptr.blockId, OFFSET_ROOT_PTR);
        sb.writeUInt32BE(ptr.offset, OFFSET_ROOT_PTR + 6);
        sb.writeUInt32BE(ptr.length, OFFSET_ROOT_PTR + 10);
        sb.writeUInt8(ptr.isChain ? 1 : 0, OFFSET_ROOT_PTR + 14);
        await this.pager.writeBlock(0, sb);
    }

    /**
     * Transforms JS Value -> MetaBlock Ptr [Type][DataPtr]
     */
    async _writeMetaValue(value) {
        let type;
        let dataPtr;

        if (Array.isArray(value)) {
            type = TYPE_COLLECTION;
            const headBuf = Buffer.alloc(4096);
            // Use patched constant explicitly
            headBuf.writeUInt32BE(constants.BLOCK_TYPE.COLLECTION_HEADER, 0);
            
            dataPtr = await this.allocator.allocate(4096);
            await this.pager.writeBlock(dataPtr.blockId, headBuf);
            
            const col = new Collection(dataPtr.blockId, this.allocator);
            await col.saveHeader();

            for(let item of value) {
                // IMPORTANT: Use append which handles paging internally
                await col.append(Date.now().toString() + Math.random(), item);
            }
        } 
        else if (typeof value === 'object' && value !== null && !(value instanceof Date) && !(value instanceof Buffer)) {
            type = TYPE_BTREE;
            const tree = new BTree(this.allocator);
            const rootPtr = await tree.saveNode({ isLeaf: true, keys: [], values: [], children: [], count: 0 });
            
            for (let k in value) {
                if (Object.hasOwnProperty.call(value, k)) {
                    const subPtr = await this._writeMetaValue(value[k]);
                    await tree.insert(k, subPtr);
                }
            }
            // Store BTree Root Ptr in a wrapper buffer
            const buf = Buffer.alloc(20);
            buf.write("TREE", 0);
            this._writePtrToBuf(buf, 4, tree.rootPtr);
            dataPtr = await this.allocator.allocate(20);
            await this._writeChainSafe(dataPtr, buf);
        } 
        else {
            type = TYPE_RAW;
            // serializeValue returns { type, data, ... } or Buffer if fullBuffer=true
            const buffer = serializeValue(value, true);
            dataPtr = await this.allocator.allocate(buffer.length);
            await this._writeChainSafe(dataPtr, buffer);
        }

        const metaBuf = Buffer.alloc(16);
        metaBuf.writeUInt8(type, 0);
        this._writePtrToBuf(metaBuf, 1, dataPtr);
        
        const metaPtr = await this.allocator.allocate(16);
        await this._writeChainSafe(metaPtr, metaBuf);
        return metaPtr;
    }

    async _resolveValueFull(metaPtr) {
        const metaBuf = await this._readChainSafe(metaPtr);
        if (!metaBuf) return undefined;
        
        const type = metaBuf.readUInt8(0);
        const dataPtr = this._readPtrFromBuf(metaBuf, 1);
        
        if (type === TYPE_RAW) {
            const valBuf = await this._readChainSafe(dataPtr);
            return parser.parseValue(valBuf, 0).value;
        } 
        else if (type === TYPE_BTREE) {
            const handleBuf = await this._readChainSafe(dataPtr);
            const rootPtr = this._readPtrFromBuf(handleBuf, 4);
            const tree = new BTree(this.allocator, rootPtr);
            return await this._harvestTree(tree);
        }
        else if (type === TYPE_COLLECTION) {
            const col = new Collection(dataPtr.blockId, this.allocator);
            await col.load();
            const result = [];
            let curr = col.headPageId;
            while (curr !== 0) {
                const page = new (require('./structure/page.js'))(curr, this.allocator);
                await page.load();
                for(let item of page.items) {
                    const valBuf = await this._readChainSafe(item.ptr);
                    result.push(v1Adapter.decode(valBuf, item.type));
                }
                curr = page.nextPageId;
            }
            return result;
        }
        return null;
    }

    async _harvestTree(tree) {
        const root = await tree.getRoot();
        return await this._harvestNode(tree, root);
    }

    async _harvestNode(tree, node) {
        const result = {};
        for(let i=0; i<node.keys.length; i++) {
            const key = node.keys[i];
            const valPtr = node.values[i];
            result[key] = await this._resolveValueFull(valPtr);
        }
        if (!node.isLeaf) {
            for(let childPtr of node.children) {
                const childNode = await tree.loadNode(childPtr);
                const sub = await this._harvestNode(tree, childNode);
                Object.assign(result, sub);
            }
        }
        return result;
    }

    async _writeChainSafe(ptr, buffer) {
        if (ptr.isChain) {
            let rem = buffer;
            let blkId = ptr.blockId;
            while (rem.length > 0) {
                const blk = await this.pager.readBlock(blkId);
                const start = (blkId === ptr.blockId) ? ptr.offset : constants.UNIT_SIZE;
                const avail = constants.BLOCK_SIZE - start;
                const chunk = Math.min(rem.length, avail);
                rem.subarray(0, chunk).copy(blk, start);
                await this.pager.writeBlock(blkId, blk);
                rem = rem.subarray(chunk);
                blkId++;
            }
        } else {
            await this.allocator.writeUserSpace(ptr, buffer);
        }
    }

    async _readChainSafe(ptr) {
        if (!ptr) return null;
        if (ptr.isChain) {
             const blocks = Math.ceil(ptr.length / 4096) + 1; 
             const raw = await this.pager.readSequential(ptr.blockId, blocks);
             const buf = Buffer.alloc(ptr.length);
             let bufOff = 0;
             let rem = ptr.length;
             for(let i=0; i<blocks; i++) {
                 if (rem <= 0) break;
                 const start = (i===0) ? ptr.offset : constants.UNIT_SIZE;
                 const avail = constants.BLOCK_SIZE - start;
                 const chunk = Math.min(rem, avail);
                 raw.subarray(i*4096 + start, i*4096 + start + chunk).copy(buf, bufOff);
                 bufOff += chunk;
                 rem -= chunk;
             }
             return buf;
        } else {
            const blk = await this.pager.readBlock(ptr.blockId);
            return blk.subarray(ptr.offset, ptr.offset + ptr.length);
        }
    }

    _writePtrToBuf(buf, offset, ptr) {
        writePointer48(buf, ptr.blockId, offset);
        buf.writeUInt32BE(ptr.offset, offset + 6);
        buf.writeUInt32BE(ptr.length, offset + 10);
        buf.writeUInt8(ptr.isChain ? 1 : 0, offset + 14);
    }

    _readPtrFromBuf(buf, offset) {
        const b = readPointer48(buf, offset);
        const o = buf.readUInt32BE(offset + 6);
        const l = buf.readUInt32BE(offset + 10);
        const c = buf.readUInt8(offset + 14);
        return { blockId: b, offset: o, length: l, isChain: c === 1 };
    }
}

AwtsmoosDB.TYPES = { TYPE_RAW, TYPE_BTREE, TYPE_COLLECTION };
module.exports = AwtsmoosDB;