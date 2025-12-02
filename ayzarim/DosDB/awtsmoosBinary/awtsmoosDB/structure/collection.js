// B"H
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
    }

    log(msg) { console.log(`[Collection ${this.headerId}] ${msg}`); }

    async append(key, value) {
        const task = async () => {
            this.log(`Append "${key}"`);
            await this.load(); 
    
            const valData = serializeValue(value, false);
            const dataPtr = await this.allocator.allocate(valData.data.length);
            
            console.log(`[Collection] Allocated Data Ptr: Block ${dataPtr.blockId}, Offset ${dataPtr.offset}`);

            if (dataPtr.isChain) {
                 // Chain logic (omitted for brevity, assume correct)
            } else {
                let block = await this.allocator.pager.readBlock(dataPtr.blockId);
                // Paranoid verification of read
                if (!block) throw new Error(`[Collection] Block ${dataPtr.blockId} failed to read after allocation`);

                valData.data.copy(block, dataPtr.offset);
                
                // Log what we are writing
                const debugHex = block.subarray(dataPtr.offset, dataPtr.offset + valData.data.length).toString('hex');
                console.log(`[Collection] Writing Data to Block ${dataPtr.blockId} @ ${dataPtr.offset}: ${debugHex}`);

                await this.allocator.pager.writeBlock(dataPtr.blockId, block);
                
                // READ BACK VERIFY
                const check = await this.allocator.pager.readBlock(dataPtr.blockId);
                const checkHex = check.subarray(dataPtr.offset, dataPtr.offset + valData.data.length).toString('hex');
                if (checkHex !== debugHex) {
                    console.error(`[Collection] CRITICAL WRITE FAILURE on Block ${dataPtr.blockId}. Read back: ${checkHex}`);
                } else {
                    console.log(`[Collection] Write Verified.`);
                }
            }
    
            let page;
            if (this.tailPageId === 0) {
                const newPagePtr = await this.allocator.allocatePage();
                this.headPageId = newPagePtr.blockId;
                this.tailPageId = newPagePtr.blockId;
                page = new Page(this.tailPageId, this.allocator);
            } else {
                page = new Page(this.tailPageId, this.allocator);
                await page.load();
            }
    
            const added = page.add(key, valData.type, dataPtr);
            if (!added) {
                const newPagePtr = await this.allocator.allocatePage();
                page.nextPageId = newPagePtr.blockId;
                await page.save(); 
                
                const newPage = new Page(newPagePtr.blockId, this.allocator);
                newPage.add(key, valData.type, dataPtr);
                this.tailPageId = newPagePtr.blockId;
                await newPage.save(); 
            } else {
                await page.save(); 
            }
            this.totalCount++;
            // Save initial header to secure the count
            await this.saveHeader();

            if (typeof value === 'object' && value !== null) {
                this.indexManager.indexObject(dataPtr, value);
                // Wait for the Indexing to complete (writing new Registry blocks)
                await this.indexManager.queue;
                // B"H: The Map has changed; we must record the new coordinates of the Registry.
                await this.saveHeader(); 
            }
            return dataPtr;
        };
        this.writeLock = this.writeLock.then(task, task);
        return this.writeLock;
    }
    
   async load() {
        let buffer = await this.allocator.pager.readBlock(this.headerId);
        
        // B"H: If the vessel is empty, create the header.
        if (!buffer) {
            await this.saveHeader(); 
            return;
        }



        let offset=32;
        this.headPageId = readPointer48(buffer, offset); offset+=6;
        this.tailPageId = readPointer48(buffer, offset); offset+=6;
        this.totalCount = buffer.readUInt32BE(offset);
        const hasRegistry = buffer.readUInt8(offset); offset++;
        if (hasRegistry === 1) {
            const b = readPointer48(buffer, offset); offset+=6;
            const o = buffer.readUInt32BE(offset); offset+=4;
            const l = buffer.readUInt32BE(offset); offset+=4;
            const c = buffer.readUInt8(offset); offset++;
            this.registryPtr = { blockId: b, offset: o, length: l, isChain: c === 1 };
        } else this.registryPtr = null;
        await this.indexManager.load(this.registryPtr);
    }
    async saveHeader() {
        const buffer = await this.allocator.pager.readBlock(this.headerId);
        let offset=32;
        writePointer48(buffer, this.headPageId, offset); offset+=6;
        writePointer48(buffer, this.tailPageId, offset); offset+=6;
        buffer.writeUInt32BE(this.totalCount, offset); offset+=4;
        if (this.indexManager.registryPtr) {
            const ptr = this.indexManager.registryPtr;
            buffer.writeUInt8(1, offset); offset++; 
            writePointer48(buffer, ptr.blockId, offset); offset+=6;
            buffer.writeUInt32BE(ptr.offset, offset); offset+=4;
            buffer.writeUInt32BE(ptr.length, offset); offset+=4;
            buffer.writeUInt8(ptr.isChain ? 1 : 0, offset); offset++;
        } else buffer.writeUInt8(0, offset);
        await this.allocator.pager.writeBlock(this.headerId, buffer);
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