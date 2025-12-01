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
    constructor(filePath) {
        this.pager = new Pager(filePath); 
        this.allocator = new Allocator(this.pager);
        this.root = null;
        this.ready = false;
    }

    async open() {
        if (this.ready) return;
        
        await this.pager.init();

        let superblock = await this.pager.readBlock(0);
        if (!superblock || superblock.length === 0) {
            await this.formatNewFile();
        } else {
            const rootId = readPointer48(superblock, constants.SB_OFFSETS.ROOT_COLLECTION_ID);
            const nextSeq = readPointer48(superblock, constants.SB_OFFSETS.NEXT_SEQ_BLOCK);
            
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
    }

    // --- Public API ---

    async set(key, value) {
	    await this.open();
	    await this.root.append(key, value);
	    await this.root.delete(key, (ptr, type) => this.resolvePointer(ptr, type));
	}

    async get(key) {
        await this.open();
        
        let pageId = this.root.headPageId;
        let lastFoundItem = undefined;

        while (pageId !== 0) {
            const page = new (require('./structure/page.js'))(pageId, this.allocator);
            await page.load();
            
            for (let i = 0; i < page.items.length; i++) {
                if (page.items[i].key === key) {
                    lastFoundItem = page.items[i];
                }
            }
            
            pageId = page.nextPageId;
        }

        if (lastFoundItem) {
            return await this.resolvePointer(lastFoundItem.ptr, lastFoundItem.type);
        }
        return undefined;
    }

    async delete(key) {
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
	    if (type === constants.VAL_TYPE.OBJECT) return parser.parse(buffer);
	    if (type === constants.VAL_TYPE.ARRAY) return parser.parse(buffer);
	    if (type === constants.VAL_TYPE.BOOLEAN_TRUE) return true;
	    if (type === constants.VAL_TYPE.BOOLEAN_FALSE) return false;
	    if (type === constants.VAL_TYPE.NULL) return null;
	    if (type === constants.VAL_TYPE.UNDEFINED) return undefined;
	    if (type === constants.VAL_TYPE.NAN) return NaN;
	    if (type === constants.VAL_TYPE.INFINITY) return Infinity;
	    if (type === constants.VAL_TYPE.NEG_INFINITY) return -Infinity;
	    
	    if (type === constants.VAL_TYPE.UINT8) return buffer.readUInt8(0);
	    if (type === constants.VAL_TYPE.UINT16) return buffer.readUInt16BE(0);
	    if (type === constants.VAL_TYPE.UINT32) return buffer.readUInt32BE(0);
	    if (type === constants.VAL_TYPE.UINT64) return Number(buffer.readBigUInt64BE(0));
	    if (type === constants.VAL_TYPE.DOUBLE_POS) return buffer.readDoubleBE(0);
	    if (type === constants.VAL_TYPE.DOUBLE_NEG) return -1 * buffer.readDoubleBE(0);
	    
	    return buffer;
	}
	
    async close() {
        if (!this.ready) return;
        
        await this.root.writeLock;
        await this.root.indexManager.queue;
        
        // CRITICAL: Save Allocator State to Superblock
        await this.allocator.saveState();
        
        await this.pager.close();
        this.ready = false;
        console.log("B\"H: AwtsmoosDB closed safely.");
    }
}

module.exports = AwtsmoosDB;