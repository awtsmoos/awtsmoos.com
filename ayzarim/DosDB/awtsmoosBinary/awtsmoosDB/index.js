// B"H
// AwtsmoosDB Main Entry Point
// FULL VERSION WITH LOGGING & FIXES

const Pager = require('./core/pager.js');
const Allocator = require('./core/allocator.js');
const Collection = require('./structure/collection.js');
const constants = require('./constants.js');
const parser = require('./deserialize/parser.js');
const serializeValue = require('./serialize/serializeValue.js');
const { decode } = require('./deserialize/v1_adapter.js');
const { writePointer48, readPointer48 } = require('./utils/binaryHelpers.js');

class AwtsmoosDB {
    constructor(filePath, options = {}) {
        this.filePath = filePath;
        this.options = options;
        
        this.pager = new Pager(filePath);
        this.allocator = new Allocator(this.pager);
        
        // The Main Key-Value Store is Collection #1 (Block 1)
        this.collection = new Collection(1, this.allocator); 
        
        this.isOpen = false;
    }

    log(msg) {
        if (this.options.verbose) {
            console.log(`[AwtsmoosDB] ${msg}`);
        }
    }

    /**
     * Opens the database, formats if new, and recovers state.
     */
    async open() {
        if (this.isOpen) return;
        this.log("Opening Database...");
        
        await this.pager.init();
        
        const stats = await this.pager.handle.stat();
        if (stats.size === 0) {
            this.log("New file detected. Formatting...");
            await this.formatNewFile();
        } else {
            // Restore Allocator Cursor from Superblock
            const sb = await this.pager.readBlock(0);
            const savedCursor = readPointer48(sb, constants.SB_OFFSETS.NEXT_SEQ_BLOCK);
            
            // Safety: Ensure we don't overwrite the Header (Block 1)
            this.allocator.cursor = Math.max(2, savedCursor);
            this.log(`Database opened. Allocator Cursor restored to ${this.allocator.cursor}`);
        }

        this.isOpen = true;
    }

    /**
     * Initializes a fresh database file with Superblock and Collection Header.
     */
    async formatNewFile() {
        // Block 0: Superblock
        const sb = Buffer.alloc(constants.BLOCK_SIZE);
        sb.write("AWTSMOOS_DB_V2", 0); 
        // Write Cursor = 2 (Skip SB and Header)
        writePointer48(sb, 2, constants.SB_OFFSETS.NEXT_SEQ_BLOCK);
        
        await this.pager.writeBlock(0, sb);
        
        // Block 1: Collection Header (Empty)
        const header = Buffer.alloc(constants.BLOCK_SIZE);
        // Zeros are valid for an empty collection (Head=0, Tail=0, Count=0)
        await this.pager.writeBlock(1, header);
        
        this.log("Format complete. Superblock (0) and Header (1) initialized.");
        
        // Force sync to ensure format is persisted
        if (this.pager.handle) await this.pager.handle.sync();
    }

    /**
     * Stores a value associated with a key.
     */
    async set(key, value) {
        if (!this.isOpen) throw new Error("DB not open");
        this.log(`SET "${key}" start.`);
        try {
            const ptr = await this.collection.append(key, value);
            this.log(`SET "${key}" success. Ptr Block: ${ptr.blockId}`);
            
            // VERIFICATION READ (Debug)
            // const verifyBuf = await this.pager.readBlock(1);
            // this.log(`[VERIFY] Post-SET Block 1 Offset 32 hex: ${verifyBuf.subarray(32, 40).toString('hex')}`);
            
            return ptr;
        } catch (e) {
            console.error(`SET "${key}" FAILED:`, e);
            throw e;
        }
    }

    /**
     * Retrieves a value by key.
     */
    async get(key) {
        if (!this.isOpen) throw new Error("DB not open");
        this.log(`GET "${key}" start.`);
        
        // Start scanning from the head page
        // Note: getPage(0) returns items from the logical "first page", 
        // but we need to traverse the linked list to find the key if it's deeper.
        
        // Manual iteration logic to find the specific key:
        let pageId = this.collection.headPageId;
        const Page = require('./structure/page.js');
        
        while(pageId !== 0) {
            this.log(`Scanning Page ${pageId}...`);
            const page = new Page(pageId, this.allocator);
            await page.load();
            
            const item = page.items.find(i => i.key === key);
            if (item) {
                this.log(`Found Key in Page ${pageId}. Reading Data at Block ${item.ptr.blockId}...`);
                const buffer = await this.resolvePointer(item.ptr);
                
                // Decode the value based on its type
                return decode(buffer, item.type);
            }
            
            pageId = page.nextPageId;
        }
        
        this.log(`GET "${key}" FAILED. Not found.`);
        return undefined;
    }

    /**
     * Deletes a key.
     */
    async delete(key) {
        if (!this.isOpen) throw new Error("DB not open");
        return await this.collection.delete(key, this.resolvePointer.bind(this));
    }

    /**
     * Helper: Reads the actual data from a Pointer (handling Chains).
     */
    async resolvePointer(ptr) {
        if (ptr.isChain) {
             const buf = Buffer.alloc(ptr.length);
             let read = 0;
             let remaining = ptr.length;
             
             // Calculate how many blocks this chain spans
             // We need to account for headers in OVERFLOW blocks if they were written with them.
             // Our Allocator writes pure data into OVERFLOW blocks but skips the Header (Unit 0).
             // So valid data is BLOCK_SIZE - UNIT_SIZE per block.
             
             const dataPerBlock = constants.BLOCK_SIZE - constants.UNIT_SIZE;
             const blocksNeeded = Math.ceil(ptr.length / dataPerBlock);
             
             for(let i=0; i < blocksNeeded; i++) {
                 const blk = await this.pager.readBlock(ptr.blockId + i);
                 if (!blk) break; // Should not happen
                 
                 const dataStart = constants.UNIT_SIZE;
                 const toCopy = Math.min(remaining, constants.BLOCK_SIZE - dataStart);
                 
                 blk.copy(buf, read, dataStart, dataStart + toCopy);
                 
                 read += toCopy;
                 remaining -= toCopy;
             }
             return buf;
        } else {
             const block = await this.pager.readBlock(ptr.blockId);
             if (!block) return null;
             return block.subarray(ptr.offset, ptr.offset + ptr.length);
        }
    }

    async close() {
        this.log("Closing...");
        // Save Allocator State before closing
        if (this.allocator) {
            await this.allocator.saveState();
        }
        await this.pager.close();
        this.log("Closed.");
    }
}

module.exports = AwtsmoosDB;