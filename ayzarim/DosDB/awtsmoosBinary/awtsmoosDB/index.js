// B"H
const path = require('path');
const Pager = require('./core/pager.js');
const Allocator = require('./core/allocator.js');
const Collection = require('./structure/collection.js');
const constants = require('./constants.js');
const v1_adapter = require('./deserialize/v1_adapter.js');

class AwtsmoosDB {
    constructor(dbPath, options = {}) {
        this.dbPath = dbPath;
        this.options = options;
        this.pager = new Pager(dbPath);
        this.allocator = new Allocator(this.pager);
        this.collection = null;
        this.sb = null;
    }

    log(msg) {
        console.log(`[AwtsmoosDB] ${msg}`);
    }

    async open() {
        this.log("Opening Database...");
        await this.pager.init();
        
        // 1. Read Superblock
        let sb = await this.pager.readBlock(0);
        
        if (!sb || sb.length === 0 || sb.every(b => b === 0)) {
            this.log("New file detected. Formatting...");
            
            // Format Superblock
            sb = Buffer.alloc(constants.BLOCK_SIZE);
            sb.write('AwtsmoosDB', 0); // Magic
            sb.writeBigUInt64BE(1n, 8); // Version
            
            // Format Allocator State (Block 2 start)
            // Cursor starts at 2 (0=SB, 1=CollectionHeader)
            const { writePointer48 } = require('./utils/binaryHelpers.js');
            writePointer48(sb, 2, constants.SB_OFFSETS.NEXT_SEQ_BLOCK);
            
            await this.pager.writeBlock(0, sb);
            
            // Format Collection Header (Block 1)
            const colHeader = Buffer.alloc(constants.BLOCK_SIZE);
            // Mark as Metadata Block
            colHeader.writeUInt32BE(constants.BLOCK_TYPE.METADATA, 0);
            
            await this.pager.writeBlock(1, colHeader);
            
            this.allocator.cursor = 2; // Sync allocator
            this.log("Format complete. Superblock (0) and Header (1) initialized.");
        } else {
             // Recover Allocator State
             const { readPointer48 } = require('./utils/binaryHelpers.js');
             const nextSeq = readPointer48(sb, constants.SB_OFFSETS.NEXT_SEQ_BLOCK);
             this.allocator.cursor = nextSeq > 2 ? nextSeq : 2;
             this.allocator.lastFreeHint = this.allocator.cursor;
             this.log(`Database Opened. Next Seq Block: ${this.allocator.cursor}`);
        }

        this.collection = new Collection(1, this.allocator);
        await this.collection.load();
    }

    async set(key, value) {
        this.log(`SET "${key}" start.`);
        try {
            const ptr = await this.collection.append(key, value);
            this.log(`SET "${key}" success. Ptr Block: ${ptr.blockId}`);
        } catch (e) {
            console.error(`SET Error:`, e);
            throw e;
        }
    }

    async get(key) {
        this.log(`GET "${key}" start.`);
        
        // 1. Scan Pages
        let currentPageId = this.collection.headPageId;
        const Page = require('./structure/page.js');
        
        while (currentPageId !== 0) {
            this.log(`Scanning Page ${currentPageId}...`);
            const page = new Page(currentPageId, this.allocator);
            await page.load();
            
            const item = page.items.find(i => i.key === key);
            if (item) {
                this.log(`Found Key in Page ${currentPageId}. Reading Data at Block ${item.ptr.blockId}...`);
                
                // 2. Read Data
                let buffer;
                if (item.ptr.isChain) {
                    // Calculate blocks needed
                    const endBlockId = Math.floor(((item.ptr.blockId * constants.BLOCK_SIZE) + item.ptr.offset + item.ptr.length - 1) / constants.BLOCK_SIZE);
                    const count = (endBlockId - item.ptr.blockId) + 1;
                    const rawChain = await this.pager.readSequential(item.ptr.blockId, count);
                    
                    buffer = Buffer.alloc(item.ptr.length);
                    let bufOffset = 0;
                    let rem = item.ptr.length;
                    
                    for(let i=0; i<count; i++) {
                        const start = (i===0) ? item.ptr.offset : constants.UNIT_SIZE;
                        const avail = constants.BLOCK_SIZE - start;
                        const copy = Math.min(rem, avail);
                        rawChain.copy(buffer, bufOffset, (i*constants.BLOCK_SIZE) + start, (i*constants.BLOCK_SIZE) + start + copy);
                        bufOffset += copy;
                        rem -= copy;
                    }
                } else {
                    const block = await this.pager.readBlock(item.ptr.blockId);
                    if (!block) return undefined;
                    
                    // Log the raw block read for debugging
                    // console.log(`[Read Debug] Block ${item.ptr.blockId} Dump (32-48): ${block.subarray(32, 48).toString('hex')}`);
                    // console.log(`[Read Debug] Extracting Offset ${item.ptr.offset}, Length ${item.ptr.length}`);
                    
                    buffer = block.subarray(item.ptr.offset, item.ptr.offset + item.ptr.length);
                    
                    // Log the extracted buffer
                    this.log(`Extracted Buffer (Hex): ${buffer.toString('hex')}`);
                }
                
                // 3. Decode
                const val = v1_adapter.decode(buffer, item.type);
                return val;
            }
            
            currentPageId = page.nextPageId;
        }
        
        this.log(`GET "${key}" FAILED. Not found.`);
        return undefined;
    }

    async close() {
        this.log("Closing...");
        if (this.allocator && this.allocator.saveState) {
            await this.allocator.saveState();
        }
        await this.pager.close();
        this.log("Closed.");
    }
}

module.exports = AwtsmoosDB;