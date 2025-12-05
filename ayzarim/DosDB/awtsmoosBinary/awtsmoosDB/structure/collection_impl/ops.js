// B"H
const constants = require('../../constants.js');
const Page = require('../page.js');
const serializeValue = require('../../serialize/serializeValue.js');

const HEADER_SIZE = constants.HEADER_SIZE || 64;

class CollectionOps {
    constructor(collection) {
        this.col = collection;
        this.allocator = collection.allocator;
    }

    async append(key, value) {
        const task = async () => {
            this.col.log(`Append initiated for key: "${key}"`);
            await this.col.load(); 
    
            // 1. Serialize and Store the Value
            const valData = serializeValue(value, false);
            const allocSize = Math.max(1, valData.data.length);
            
            this.col.log(`Allocating value blob of size ${allocSize} for "${key}"`);
            const dataPtr = await this.allocator.allocate(allocSize);
            
            if (dataPtr.isChain) {
                 this.col.log(`Value is large (Chain). Writing to Block ${dataPtr.blockId}...`);
                 let remaining = valData.data;
                 let currentBlock = dataPtr.blockId;
                 while(remaining.length > 0) {
                     let blk = await this.allocator.readBlockLocked(currentBlock);
                     if (!blk) blk = Buffer.alloc(constants.BLOCK_SIZE);

                     const start = (currentBlock === dataPtr.blockId) ? dataPtr.offset : HEADER_SIZE;
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
            if (this.col.tailPageId === 0) {
                this.col.log(`First item. Allocating Head Page.`);
                const newPagePtr = await this.allocator.allocatePage(constants.BLOCK_TYPE.COLLECTION_PAGE);
                this.col.headPageId = newPagePtr.blockId;
                this.col.tailPageId = newPagePtr.blockId;
                page = new Page(this.col.tailPageId, this.allocator);
            } else {
                page = new Page(this.col.tailPageId, this.allocator);
                await page.load();
            }
    
            const added = page.add(key, valData.type, dataPtr);
            
            if (!added) {
                this.col.log(`Tail page ${this.col.tailPageId} full. Splitting/Chaining.`);
                const newPagePtr = await this.allocator.allocatePage(constants.BLOCK_TYPE.COLLECTION_PAGE);
                
                page.setNextPage(newPagePtr.blockId);
                await page.save(); 
                
                const newPage = new Page(newPagePtr.blockId, this.allocator);
                newPage.add(key, valData.type, dataPtr);
                this.col.tailPageId = newPagePtr.blockId;
                await newPage.save(); 
            } else {
                await page.save(); 
            }
            
            this.col.totalCount++;
            await this.col.saveHeader();

            if (typeof value === 'object' && value !== null) {
                this.col.indexManager.indexObject(dataPtr, value);
                await this.col.indexManager.queue;
                this.col.registryPtr = this.col.indexManager.registryPtr;
                await this.col.saveHeader(); 
            }
            this.col.log(`Append Complete. Total: ${this.col.totalCount}`);
            return dataPtr;
        };
        this.col.writeLock = this.col.writeLock.then(task, task);
        return this.col.writeLock;
    }
}

module.exports = CollectionOps;