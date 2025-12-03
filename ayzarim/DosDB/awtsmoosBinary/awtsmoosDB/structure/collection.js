// B"H
/**
 * @file collection.js
 * @description
 *  Manages a sequential list of items (The Many).
 *  Handles the chaining of Pages and the Indexing of Objects.
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
        // console.log(`[Collection ${this.headerId}] ${msg}`); 
    }

    /**
     * Appends an Item to the Collection.
     * Handles Page Splitting if the current Tail is full.
     */
    async append(key, value) {
        const task = async () => {
            this.log(`Append "${key}"`);
            await this.load(); 
    
            // 1. Serialize and Store the Value (The Light)
            const valData = serializeValue(value, false);
            // Handle edge case of empty data (e.g. empty string)
            const allocSize = Math.max(1, valData.data.length);
            const dataPtr = await this.allocator.allocate(allocSize);
            
            if (dataPtr.isChain) {
                 // Chain writing logic for large values
                 let remaining = valData.data;
                 let currentBlock = dataPtr.blockId;
                 while(remaining.length > 0) {
                     // B"H: Locked Read
                     let blk = await this.allocator.readBlockLocked(currentBlock);
                     if (!blk) blk = Buffer.alloc(constants.BLOCK_SIZE);

                     const start = (currentBlock === dataPtr.blockId) ? dataPtr.offset : constants.UNIT_SIZE;
                     const avail = constants.BLOCK_SIZE - start;
                     const chunk = Math.min(remaining.length, avail);
                     
                     remaining.subarray(0, chunk).copy(blk, start);
                     // B"H: Locked Write
                     await this.allocator.writeBlockLocked(currentBlock, blk);
                     
                     remaining = remaining.subarray(chunk);
                     currentBlock++;
                 }
            } else {
                await this.allocator.writeUserSpace(dataPtr, valData.data);
            }
    
            // 2. Add Reference to Page (The Vessel)
            let page;
            if (this.tailPageId === 0) {
                // First Page Creation
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
                // Page Full -> Extend the Chain
                const newPagePtr = await this.allocator.allocatePage(constants.BLOCK_TYPE.COLLECTION_PAGE);
                
                // Link old tail to new page
                page.setNextPage(newPagePtr.blockId);
                await page.save(); 
                
                // Initialize new page
                const newPage = new Page(newPagePtr.blockId, this.allocator);
                newPage.add(key, valData.type, dataPtr);
                this.tailPageId = newPagePtr.blockId;
                await newPage.save(); 
            } else {
                await page.save(); 
            }
            
            this.totalCount++;
            await this.saveHeader();

            // 3. Update Indexes if necessary
            if (typeof value === 'object' && value !== null) {
                this.indexManager.indexObject(dataPtr, value);
                // We rely on queue to process, but we must save header to point to registry
                // Wait for index op to queue up, then ensure registry ptr is saved next cycle
                await this.indexManager.queue;
                this.registryPtr = this.indexManager.registryPtr;
                await this.saveHeader(); 
            }
            return dataPtr;
        };
        // Enforce write serialization
        this.writeLock = this.writeLock.then(task, task);
        return this.writeLock;
    }
    
   async load() {
        if (!this.headerId || this.headerId <= 0 || isNaN(this.headerId)) {
             console.error(`B"H: Collection Load Failed. Invalid Header ID: ${this.headerId}`);
             return;
        }

        // B"H: Locked Read for atomic consistency
        let buffer = await this.allocator.readBlockLocked(this.headerId);
        
        if (!buffer) {
            // Block doesn't exist yet, initialize header
            await this.saveHeader(); 
            return;
        }

        // B"H: Strict Block Type Check
        const type = buffer.readUInt32BE(0);
        if (type !== (constants.BLOCK_TYPE.COLLECTION_HEADER || 3) && type !== 0) {
             // If type is wrong, this is NOT a collection header.
             // It might be a reused block ID. Fail gracefully.
             console.error(`B"H: Collection Load Failed. Block ${this.headerId} has type ${type}, expected COLLECTION_HEADER`);
             return;
        }

        // B"H: Validate Signature "CLHD" at offset 4 (after Block Type)
        // Offset 0: Type (4 bytes)
        // Offset 4: Sig (4 bytes)
        const signature = buffer.toString('utf8', 4, 8);
        if (signature !== this.MAGIC_HEAD) {
            // If signature is missing, assume uninitialized or corrupted
            this.headPageId = 0;
            this.tailPageId = 0;
            this.totalCount = 0;
            this.registryPtr = null;
            return;
        }

        let offset = 8; // Skip Type(4) + Sig(4)
        
        this.headPageId = readPointer48(buffer, offset); offset+=6;
        this.tailPageId = readPointer48(buffer, offset); offset+=6;
        this.totalCount = buffer.readUInt32BE(offset);
        offset += 4;
        
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
        
        await this.indexManager.load(this.registryPtr);
    }

    async saveHeader() {
        if (!this.headerId || this.headerId <= 0 || isNaN(this.headerId)) {
             console.error(`B"H: Collection SaveHeader Failed. Invalid Header ID: ${this.headerId}`);
             return;
        }

        // Allocate a fresh buffer to ensure no garbage
        let buffer = Buffer.alloc(constants.BLOCK_SIZE);
        
        // Write Block Type
        buffer.writeUInt32BE(constants.BLOCK_TYPE.COLLECTION_HEADER || 3, 0);
        
        // Write Signature "CLHD"
        buffer.write(this.MAGIC_HEAD, 4);

        // Mark header as used in bitmap
        // Fixed: Use 'buffer.fill', not 'block.fill' (which caused ReferenceError)
        buffer.fill(0xFF, constants.BITMAP_OFFSET, constants.BITMAP_OFFSET + constants.BITMAP_SIZE);

        let offset = 8; // Type(4) + Sig(4)
        
        writePointer48(buffer, this.headPageId, offset); offset+=6;
        writePointer48(buffer, this.tailPageId, offset); offset+=6;
        buffer.writeUInt32BE(this.totalCount, offset); offset+=4;
        
        // Ensure we persist the latest registry pointer from the manager
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
        
        // B"H: Locked Write for atomic consistency
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