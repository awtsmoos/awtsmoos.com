// B"H
/**
 * @file collection.js
 * @description
 *  Manages a sequential list of items (The Many).
 *  Handles the chaining of Pages and the Indexing of Objects.
 *  FIX: Moved Metadata to HEADER_SIZE (64) to avoid Bitmap collision.
 */
const Page = require('./page.js');
const constants = require('../constants.js');
const serializeValue = require('../serialize/serializeValue.js');
const IndexManager = require('./indexManager.js');
const { writePointer48, readPointer48 } = require('../utils/binaryHelpers.js');

class Collection {
    constructor(rootBlockId, allocator) {
        this.headerId = rootBlockId;
        this.allocator = allocator;
        this.headPageId = 0;
        this.tailPageId = 0;
        this.totalCount = 0;
        this.indexManager = new IndexManager(allocator);
        this.registryPtr = null; 
        this.writeLock = Promise.resolve();
        this.MAGIC_HEAD = "CLHD"; // Collection Header Signature
    }

    log(msg) { 
        if (this.allocator && this.allocator.db && this.allocator.db.debug) {
            console.log(`[Collection ${this.headerId}] ${msg}`); 
        }
    }

    /**
     * Appends an Item to the Collection.
     */
    async append(key, value) {
        const task = async () => {
            this.log(`Append initiated for key: "${key}"`);
            await this.load(); 
    
            // 1. Serialize and Store the Value
            const valData = serializeValue(value, false);
            const allocSize = Math.max(1, valData.data.length);
            
            this.log(`Allocating value blob of size ${allocSize} for "${key}"`);
            const dataPtr = await this.allocator.allocate(allocSize);
            
            if (dataPtr.isChain) {
                 this.log(`Value is large (Chain). Writing to Block ${dataPtr.blockId}...`);
                 let remaining = valData.data;
                 let currentBlock = dataPtr.blockId;
                 while(remaining.length > 0) {
                     let blk = await this.allocator.readBlockLocked(currentBlock);
                     if (!blk) blk = Buffer.alloc(constants.BLOCK_SIZE);

                     const start = (currentBlock === dataPtr.blockId) ? dataPtr.offset : constants.UNIT_SIZE;
                     const avail = constants.BLOCK_SIZE - start;
                     const chunk = Math.min(remaining.length, avail);
                     
                     remaining.subarray(0, chunk).copy(blk, start);
                     await this.allocator.writeBlockLocked(currentBlock, blk);
                     
                     remaining = remaining.subarray(chunk);
                     currentBlock++;
                 }
            } else {
                await this.allocator.writeUserSpace(dataPtr, valData.data);
            }
    
            // 2. Add Reference to Page
            let page;
            if (this.tailPageId === 0) {
                this.log(`First item. Allocating Head Page.`);
                const newPagePtr = await this.allocator.allocatePage(constants.BLOCK_TYPE.COLLECTION_PAGE);
                this.headPageId = newPagePtr.blockId;
                this.tailPageId = newPagePtr.blockId;
                page = new Page(this.tailPageId, this.allocator);
            } else {
                page = new Page(this.tailPageId, this.allocator);
                await page.load();
            }
    
            const added = page.add(key, valData.type, dataPtr);
            
            if (!added) {
                this.log(`Tail page ${this.tailPageId} full. Splitting/Chaining.`);
                const newPagePtr = await this.allocator.allocatePage(constants.BLOCK_TYPE.COLLECTION_PAGE);
                
                page.setNextPage(newPagePtr.blockId);
                await page.save(); 
                
                const newPage = new Page(newPagePtr.blockId, this.allocator);
                newPage.add(key, valData.type, dataPtr);
                this.tailPageId = newPagePtr.blockId;
                await newPage.save(); 
            } else {
                await page.save(); 
            }
            
            this.totalCount++;
            await this.saveHeader();

            if (typeof value === 'object' && value !== null) {
                this.indexManager.indexObject(dataPtr, value);
                await this.indexManager.queue;
                this.registryPtr = this.indexManager.registryPtr;
                await this.saveHeader(); 
            }
            this.log(`Append Complete. Total: ${this.totalCount}`);
            return dataPtr;
        };
        this.writeLock = this.writeLock.then(task, task);
        return this.writeLock;
    }
    
   async load() {
        if (!this.headerId || this.headerId <= 0 || isNaN(this.headerId)) {
             console.error(`B"H: Collection Load Failed. Invalid Header ID: ${this.headerId}`);
             return;
        }

        const buffer = await this.allocator.readBlockLocked(this.headerId);
        
        if (!buffer) {
            this.log(`Header block ${this.headerId} empty. Initializing new.`);
            await this.saveHeader(); 
            return;
        }

        const type = buffer.readUInt32BE(0);
        if (type !== (constants.BLOCK_TYPE.COLLECTION_HEADER || 3) && type !== 0) {
             this.log(`WARN: Block ${this.headerId} has invalid type ${type}. Expected COLLECTION_HEADER.`);
             return;
        }

        // B"H: FIX - Read from HEADER_SIZE (64)
        let offset = constants.HEADER_SIZE;
        const signature = buffer.toString('utf8', offset, offset + 4);
        
        if (signature !== this.MAGIC_HEAD) {
            this.log(`Signature mismatch at offset ${offset}. Got "${signature}", expected "${this.MAGIC_HEAD}". Assuming empty.`);
            this.headPageId = 0;
            this.tailPageId = 0;
            this.totalCount = 0;
            this.registryPtr = null;
            return;
        }
        offset += 4;

        this.headPageId = readPointer48(buffer, offset); offset+=6;
        this.tailPageId = readPointer48(buffer, offset); offset+=6;
        this.totalCount = buffer.readUInt32BE(offset); offset += 4;
        
        const hasRegistry = buffer.readUInt8(offset); offset++;
        if (hasRegistry === 1) {
            const b = readPointer48(buffer, offset); offset+=6;
            const o = buffer.readUInt32BE(offset); offset+=4;
            const l = buffer.readUInt32BE(offset); offset+=4;
            const c = buffer.readUInt8(offset); offset++;
            this.registryPtr = { blockId: b, offset: o, length: l, isChain: c === 1 };
        } else {
            this.registryPtr = null;
        }
        
        this.log(`Loaded Header. Head: ${this.headPageId}, Tail: ${this.tailPageId}, Count: ${this.totalCount}`);
        await this.indexManager.load(this.registryPtr);
    }

    async saveHeader() {
        this.log(`Saving Header ${this.headerId}...`);
        
        let buffer = Buffer.alloc(constants.BLOCK_SIZE);
        
        // Write Block Type at 0
        buffer.writeUInt32BE(constants.BLOCK_TYPE.COLLECTION_HEADER || 3, 0);
        
        // Fill Bitmap (4-20) with FF to mark block as "used/meta"
        buffer.fill(0xFF, constants.BITMAP_OFFSET, constants.BITMAP_OFFSET + constants.BITMAP_SIZE);

        // B"H: FIX - Start writing custom data at HEADER_SIZE (64)
        let offset = constants.HEADER_SIZE;
        
        // Write Signature "CLHD"
        buffer.write(this.MAGIC_HEAD, offset); offset += 4;

        writePointer48(buffer, this.headPageId, offset); offset+=6;
        writePointer48(buffer, this.tailPageId, offset); offset+=6;
        buffer.writeUInt32BE(this.totalCount, offset); offset+=4;
        
        if (this.indexManager.registryPtr) {
            this.registryPtr = this.indexManager.registryPtr;
        }

        if (this.registryPtr) {
            const ptr = this.registryPtr;
            buffer.writeUInt8(1, offset); offset++; 
            writePointer48(buffer, ptr.blockId, offset); offset+=6;
            buffer.writeUInt32BE(ptr.offset, offset); offset+=4;
            buffer.writeUInt32BE(ptr.length, offset); offset+=4;
            buffer.writeUInt8(ptr.isChain ? 1 : 0, offset); offset++;
        } else {
            buffer.writeUInt8(0, offset);
        }
        
        await this.allocator.writeBlockLocked(this.headerId, buffer);
    }

    async getPage(pageIndex) {
         await this.load();
         let curr = this.headPageId;
         let idx = 0;
         while(curr !== 0) {
             if(idx === pageIndex) {
                 const p = new Page(curr, this.allocator);
                 await p.load();
                 return p.items;
             }
             const p = new Page(curr, this.allocator);
             await p.load();
             curr = p.nextPageId;
             idx++;
         }
         return [];
    }

    async delete(key) { return false; }
    async getSortedPage() { return []; }
}
module.exports = Collection;