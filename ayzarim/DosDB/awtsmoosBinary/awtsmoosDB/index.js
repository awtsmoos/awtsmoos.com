// B"H
// AwtsmoosDB Main Entry Point
// FINAL PRODUCTION VERSION
// Features: WAL, Atomic Updates, Last-Write-Wins, 281PB Addressing, State Persistence

const Pager = require('./core/pager.js');
const Allocator = require('./core/allocator.js');
const Collection = require('./structure/collection.js');
const constants = require('./constants.js');
const parser = require('./deserialize/parser.js');
const { readPointer48, writePointer48 } = require('./utils/binaryHelpers.js');

class AwtsmoosDB {
    /**
     * @param {string} filePath 
     * @param {object} options 
     * @param {boolean} options.verbose - Enable detailed debug logging
     */
    constructor(filePath, options = {}) {
        this.pager = new Pager(filePath); 
        this.allocator = new Allocator(this.pager);
        this.root = null;
        this.ready = false;
        this.options = options;
    }

    log(msg) {
        if (this.options.verbose) {
            console.log(`[DB] ${msg}`);
        }
    }

    async open() {
        if (this.ready) return;
        this.log("Opening Database...");
        
        await this.pager.init();

        let superblock = await this.pager.readBlock(0);
        if (!superblock || superblock.length === 0) {
            this.log("New file detected. Formatting...");
            await this.formatNewFile();
        } else {
            const rootId = readPointer48(superblock, constants.SB_OFFSETS.ROOT_COLLECTION_ID);
            const nextSeq = readPointer48(superblock, constants.SB_OFFSETS.NEXT_SEQ_BLOCK);
            
            this.log(`Existing DB. Root: ${rootId}, Allocator Cursor: ${nextSeq}`);

            // RESTORE ALLOCATOR STATE
            // This prevents O(N) scan on startup
            if (nextSeq > 1) {
                this.allocator.cursor = Number(nextSeq);
                this.allocator.lastFreeHint = Number(nextSeq); 
            }

            this.root = new Collection(rootId, this.allocator);
            await this.root.load();
        }
        this.ready = true;
    }

    async formatNewFile() {
        const sb = Buffer.alloc(constants.BLOCK_SIZE);
        sb.writeUInt32BE(constants.BLOCK_TYPE.SUPERBLOCK, 0);
        sb.write(constants.MAGIC_HEADER, constants.SB_OFFSETS.MAGIC);
        
        writePointer48(sb, 1, constants.SB_OFFSETS.ROOT_COLLECTION_ID);
        writePointer48(sb, 2, constants.SB_OFFSETS.TOTAL_BLOCKS);
        writePointer48(sb, 2, constants.SB_OFFSETS.NEXT_SEQ_BLOCK);
        
        await this.pager.writeBlock(0, sb);

        const rootHeader = Buffer.alloc(constants.BLOCK_SIZE);
        rootHeader.writeUInt32BE(constants.BLOCK_TYPE.DATA, 0);
        rootHeader[constants.BITMAP_OFFSET] = 0b10000000;
        await this.pager.writeBlock(1, rootHeader);
        
        this.root = new Collection(1, this.allocator);
        await this.root.load();
        
        // Update allocator cursor past the headers
        this.allocator.cursor = 2;
        this.allocator.lastFreeHint = 2;
        await this.allocator.saveState();
    }

    // --- Public API ---

    async set(key, value) {
        // We chain this operation to a mutex to ensure ATOMICITY.
        // No other 'set' or 'delete' can intervene between the internal delete and append.
        const task = async () => {
            this.log(`SET "${key}" start.`);
            await this.open();
            // 1. Delete existing (Atomic Step 1)
            await this.root.delete(key, (ptr, type) => this.resolvePointer(ptr, type));
            // 2. Append new (Atomic Step 2)
            const ptr = await this.root.append(key, value);
            this.log(`SET "${key}" success. Ptr Block: ${ptr ? ptr.blockId : 'null'}`);
            return ptr;
        };

        // Simple Mutex Pattern
        this.writeLock = (this.writeLock || Promise.resolve()).then(task, task);
        return this.writeLock;
    }

    async get(key) {
        this.log(`GET "${key}" start.`);
        await this.open();
        
        // Ensure we reload header in case another process/instance updated it
        // (Though in single-process mode this is redundant but safe)
        await this.root.load();

        let pageId = this.root.headPageId;
        let lastFoundItem = undefined;
        this.log(`Scanning pages starting at ${pageId}...`);

        while (pageId !== 0) {
            const page = new (require('./structure/page.js'))(pageId, this.allocator);
            await page.load();
            
            for (let i = 0; i < page.items.length; i++) {
                if (page.items[i].key === key) {
                    lastFoundItem = page.items[i];
                    // We don't break immediately; in an append-only log structure (Collection),
                    // the last item is the valid one.
                    // HOWEVER, our Collection.append also does delete(), so there should only be one.
                    // But if delete failed or logic changed, last wins.
                }
            }
            
            pageId = page.nextPageId;
        }

        if (lastFoundItem) {
            this.log(`FOUND "${key}". resolving...`);
            return await this.resolvePointer(lastFoundItem.ptr, lastFoundItem.type);
        }
        
        this.log(`GET "${key}" FAILED. Not found.`);
        return undefined;
    }

    async delete(key) {
        this.log(`DELETE "${key}"`);
	    await this.open();
	    return await this.root.delete(key, (ptr, type) => this.resolvePointer(ptr, type));
	}

    async getConsoleView(sortField = null, page = 0, pageSize = 100) {
        await this.open();
        if (sortField) {
            return await this.root.getSortedPage(sortField, page, pageSize);
        } else {
            return await this.root.getPage(page);
        }
    }

    // --- Helpers ---

    async resolvePointer(ptr, type) {
	    const { blockId, offset, length } = ptr;
	    if (length === 0) return null;
	
	    let buffer;
	    
	    const endBlockId = BigInt(blockId) + ((BigInt(offset) + BigInt(length) - 1n) / BigInt(constants.BLOCK_SIZE));
	    const blocksToRead = Number(endBlockId - BigInt(blockId)) + 1;
	
	    if (blocksToRead === 1) {
	        const block = await this.pager.readBlock(blockId);
	        buffer = block.subarray(offset, offset + length);
	    } else {
	        const rawChain = await this.pager.readSequential(blockId, blocksToRead);
	        buffer = Buffer.alloc(length);
	        let bufOffset = 0;
	        let rem = length;
	        
	        for (let i = 0; i < blocksToRead; i++) {
	            const blockView = rawChain.subarray(i * constants.BLOCK_SIZE, (i + 1) * constants.BLOCK_SIZE);
	            const start = (i === 0) ? offset : constants.UNIT_SIZE;
	            const avail = constants.BLOCK_SIZE - start;
	            const copy = Math.min(rem, avail);
	            
	            blockView.copy(buffer, bufOffset, start, start + copy);
	            bufOffset += copy;
	            rem -= copy;
	        }
	    }
	
	    if (type === constants.VAL_TYPE.STRING) return buffer.toString('utf8');
	    
        // Pass to the strict parser for all other types
        // Note: parser.parse expects the raw buffer format we stored.
        // However, we stored [Type][Len][Data] via serializeValue.
        // But here we are resolving the POINTER which points to [Data].
        // Wait, serializeValue returns { type, data }. 
        // Collection.append writes `data`. 
        // So the buffer on disk is JUST THE DATA (plus maybe length prefix for some types?).
        // Let's check serializeValue.js.
        // serializeValue returns `data` which is the PAYLOAD. 
        // The TYPE is stored in the Page Item Header.
        
        // So we need to reconstruct what parser expects, or handle types manually here.
        // The previous parser code handled standard types.
        
	    if (type === constants.VAL_TYPE.OBJECT) return parser.parseObject(buffer, 0); // Directly parse object buffer
	    if (type === constants.VAL_TYPE.ARRAY) return parser.parseArray(buffer, 0); // Directly parse array buffer
	    
        // Primitives that were stored as raw buffers
	    if (type === constants.VAL_TYPE.BOOLEAN_TRUE) return true;
	    if (type === constants.VAL_TYPE.BOOLEAN_FALSE) return false;
	    if (type === constants.VAL_TYPE.NULL) return null;
	    if (type === constants.VAL_TYPE.UNDEFINED) return undefined;
	    if (type === constants.VAL_TYPE.NAN) return NaN;
	    if (type === constants.VAL_TYPE.INFINITY) return Infinity;
	    if (type === constants.VAL_TYPE.NEG_INFINITY) return -Infinity;
	    
        // Numerics stored as BE Bytes
	    if (type === constants.VAL_TYPE.UINT8) return buffer.readUInt8(0);
	    if (type === constants.VAL_TYPE.UINT16) return buffer.readUInt16BE(0);
	    if (type === constants.VAL_TYPE.UINT32) return buffer.readUInt32BE(0);
	    if (type === constants.VAL_TYPE.UINT64) return Number(buffer.readBigUInt64BE(0));
	    if (type === constants.VAL_TYPE.DOUBLE_POS) return buffer.readDoubleBE(0);
	    if (type === constants.VAL_TYPE.DOUBLE_NEG) return -1 * buffer.readDoubleBE(0);
	    
        // Complex Types
        if (type === constants.VAL_TYPE.DATE) return new Date(buffer.readDoubleBE(0));
        if (type === constants.VAL_TYPE.JS_BIGINT) return BigInt(buffer.toString('utf8'));
        if (type === constants.VAL_TYPE.REGEXP) {
             const { readVarInt } = require('./utils/serializer.js'); // Lazy load
             const { value: sourceLen, bytesRead } = readVarInt(buffer, 0);
             const source = buffer.toString('utf8', bytesRead, bytesRead + sourceLen);
             const flags = buffer.toString('utf8', bytesRead + sourceLen);
             return new RegExp(source, flags);
        }
        
	    return buffer;
	}
	
	
	/**
     * Rapidly finds a single object using the Secondary Index.
     * Example: db.findBy("email", "admin@awtsmoos.com")
     * Time: O(log N) - Instant.
     */
    async findBy(field, value) {
        await this.open();
        
        // 1. Get the B-Tree for this field
        const tree = this.root.indexManager.indexes.get(field);
        if (!tree) {
            console.warn(`B"H: No index found for field '${field}'. Result is null.`);
            return null;
        }

        // 2. Search the Tree
        // Note: indexObject truncates keys to 64 chars, so we match that here.
        const searchKey = String(value).substring(0, 64);
        const ptr = await tree.search(searchKey);
        
        if (!ptr) return null;

        // 3. Resolve the Data
        // Note: The B-Tree only stores the pointer, not the Type ID.
        // However, almost all indexed items are OBJECTS. 
        // We assume constants.VAL_TYPE.OBJECT (ID 1). 
        // If you indexed a primitive string directly, this might return a Buffer that needs parsing.
        return await this.resolvePointer(ptr, constants.VAL_TYPE.OBJECT);
    }
    
    
    /**
     * Maintenance: Reclaims disk space and eliminates fragmentation.
     * Strategy: Copies all live data to a new file, then swaps them.
     * EXCLUSIVE OPERATION: Locks the database. No writes allowed during this time.
     */
    async compact() {
        // We chain this to the writeLock to ensure NO new writes happen 
        // while we are migrating data.
        const task = async () => {
            if (!this.ready) await this.open();
            console.log("B\"H: Starting Compaction (Exclusive Lock)...");

            const fs = require('fs');
            // 1. Create a temporary DB
            const tempPath = this.pager.filePath + ".tmp";
            
            // Clean slate
            try { fs.unlinkSync(tempPath); } catch (e) {}
            try { fs.unlinkSync(tempPath + ".wal"); } catch (e) {}

            const tempDB = new this.constructor(tempPath);
            await tempDB.open();

            // 2. Stream all data from Current -> Temp
            let pageId = this.root.headPageId;
            let count = 0;

            try {
                while (pageId !== 0) {
                    const page = new (require('./structure/page.js'))(pageId, this.allocator);
                    await page.load();

                    for (const item of page.items) {
                        const val = await this.resolvePointer(item.ptr, item.type);
                        // We use the public set() of tempDB, which handles its own internal allocation
                        await tempDB.set(item.key, val);
                        count++;
                    }
                    pageId = page.nextPageId;
                }
            } catch (err) {
                console.error("B\"H: Compaction Failed", err);
                await tempDB.close();
                return; // Abort swap if copy failed
            }

            console.log(`B\"H: Compaction copied ${count} items.`);

            // 3. Close both instances to release file handles (Windows compatibility)
            // Note: We don't call this.close() because that would clear our lock.
            // We manually close internal components.
            await this.allocator.saveState();
            await this.pager.close();
            await tempDB.close();

            // 4. Atomic Swap
            const walPath = this.pager.filePath + ".wal";
            const tempWalPath = tempPath + ".wal";

            try { fs.unlinkSync(this.pager.filePath); } catch (e) {}
            try { fs.unlinkSync(walPath); } catch (e) {}

            fs.renameSync(tempPath, this.pager.filePath);
            if (fs.existsSync(tempWalPath)) {
                fs.renameSync(tempWalPath, walPath);
            }

            // 5. Re-initialize current instance
            this.ready = false;
            // Reset Allocator/Pager state for the new file
            this.pager = new Pager(this.pager.filePath);
            this.allocator = new Allocator(this.pager);
            await this.open();
            
            console.log("B\"H: Compaction Complete. Database reopened.");
        };

        // EXCLUSIVE LOCK
        this.writeLock = (this.writeLock || Promise.resolve()).then(task, task);
        return this.writeLock;
    }
    
    /**
     * Diagnostic: Scans the database structure to report storage efficiency.
     * Use this to decide if you need to run .compact().
     */
    async getStats() {
        if (!this.ready) await this.open();
        
        const stats = await this.pager.handle.stat();
        const totalBlocks = Math.ceil(stats.size / constants.BLOCK_SIZE);
        
        let freeBlocks = 0;      // Blocks that are 100% empty (Type 0)
        let activeBlocks = 0;    // Blocks that have at least some data
        let totalSlots = 0;      // Total 32-byte slots available in active blocks
        let usedSlots = 0;       // Slots actually holding data
        
        // Optimization: We only need the first 32 bytes (Header) of each block.
        // Reading 4KB x N is slow. Reading 32B x N is fast.
        const headerBuf = Buffer.alloc(32);
        
        for (let i = 0; i < totalBlocks; i++) {
            const offset = i * constants.BLOCK_SIZE;
            
            // Raw read of the header part only
            const { bytesRead } = await this.pager.handle.read(headerBuf, 0, 32, offset);
            if (bytesRead < 32) break; // EOF
            
            const type = headerBuf.readUInt32BE(0);
            
            if (type === constants.BLOCK_TYPE.FREE || type === 0) {
                freeBlocks++;
            } 
            else if (type === constants.BLOCK_TYPE.SUPERBLOCK) {
                // Ignore Superblock
            } 
            else {
                // Page, Data, or Overflow Block
                activeBlocks++;
                
                // Read Bitmap (Bytes 8 to 23)
                // We count how many bits are set to '1'
                // Unit 0 is always '1' (Header), so we subtract 1 at the end for pure data.
                let localUsed = 0;
                for (let byteIdx = 0; byteIdx < 16; byteIdx++) {
                    const byte = headerBuf[constants.BITMAP_OFFSET + byteIdx];
                    if (byte === 0) continue; // Optimization
                    if (byte === 255) { localUsed += 8; continue; } // Optimization
                    
                    for (let bit = 0; bit < 8; bit++) {
                        if ((byte >> (7 - bit)) & 1) localUsed++;
                    }
                }
                
                // Logic: A block has 128 units. Unit 0 is header.
                // Available for data: 127 units.
                totalSlots += 127; 
                usedSlots += (localUsed - 1); // Subtract Unit 0
            }
        }
        
        const fragmentationPct = totalSlots > 0 ? (1 - (usedSlots / totalSlots)) * 100 : 0;
        
        return {
            databaseSize: (stats.size / 1024 / 1024).toFixed(2) + " MB",
            totalBlocks: totalBlocks,
            
            // "External Fragmentation" (Empty blocks in the middle)
            // If this is high, you should .compact()
            emptyBlocks: freeBlocks, 
            
            // "Internal Fragmentation" (Holes inside used blocks)
            // This space is automatically reused by Allocator, so it's not "wasted", just "available".
            activeBlocks: activeBlocks,
            slotUsage: `${usedSlots} / ${totalSlots}`,
            fragmentation: fragmentationPct.toFixed(2) + "%"
        };
    }
	
    async close() {
        if (!this.ready) return;
        
        // 1. Wait for pending writes (Set/Delete)
        if (this.writeLock) await this.writeLock;
        if (this.root && this.root.writeLock) await this.root.writeLock;
        
        // 2. Wait for Indexer to finish processing objects
        if (this.root && this.root.indexManager) {
            await this.root.indexManager.queue;
            
             // Ensure the Index Registry Pointer is persisted to the Collection Header
             if (this.root.indexManager.dirty) {
                 await this.root.indexManager.saveRegistry();
                 await this.root.saveHeader();
            }
        }
        
        // 3. Save Allocator State (Cursor)
        await this.allocator.saveState();
        
        // 4. Close File Handles
        await this.pager.close();
        this.ready = false;
        console.log("B\"H: AwtsmoosDB closed safely.");
    }
}

module.exports = AwtsmoosDB;