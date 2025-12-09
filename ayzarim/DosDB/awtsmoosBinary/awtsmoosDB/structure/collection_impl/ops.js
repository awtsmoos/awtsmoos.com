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

    // Helper to write data blob
    async _writeData(value) {
        // B"H: FIX - Use 'false' to get raw DATA payload only.
        // The Page stores the Type. We do not want to store Type/Len header in the blob
        // because v1Adapter.decode wraps it again.
        const { type, data } = serializeValue(value, false);
        
        // Allocate and write RAW data
        const ptr = await this.allocator.allocate(data.length);
        await this.allocator.db._writeChainSafe(ptr, data);
        
        return ptr;
    }

    async append(key, value) {
        const task = async () => {
            this.col.log(`Append initiated for key: "${key}"`);
            await this.col.load(); 
            
            const dataPtr = await this._writeData(value);
            const type = serializeValue(value, false).type;
    
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
    
            const added = page.add(key, type, dataPtr);
            
            if (!added) {
                this.col.log(`Tail page ${this.col.tailPageId} full. Splitting/Chaining.`);
                const newPagePtr = await this.allocator.allocatePage(constants.BLOCK_TYPE.COLLECTION_PAGE);
                
                page.setNextPage(newPagePtr.blockId);
                await page.save(); 
                
                const newPage = new Page(newPagePtr.blockId, this.allocator);
                newPage.add(key, type, dataPtr);
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

    // B"H: New Splice Implementation with Page Splits and Merges
    async splice(start, deleteCount, ...items) {
        const task = async () => {
            this.col.log(`Splice: Start ${start}, Delete ${deleteCount}, Insert ${items.length}`);
            await this.col.load();

            // 1. Prepare new items
            const newEntryPtrs = [];
            for (const item of items) {
                const dataPtr = await this._writeData(item);
                const { type } = serializeValue(item, false);
                const key = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
                newEntryPtrs.push({ key, type, ptr: dataPtr });
            }

            // Case: Empty List
            if (this.col.headPageId === 0) {
                if (items.length > 0) {
                    const newPagePtr = await this.allocator.allocatePage(constants.BLOCK_TYPE.COLLECTION_PAGE);
                    this.col.headPageId = newPagePtr.blockId;
                    this.col.tailPageId = newPagePtr.blockId;
                    let page = new Page(newPagePtr.blockId, this.allocator);
                    
                    for (const entry of newEntryPtrs) {
                         if (!page.add(entry.key, entry.type, entry.ptr)) {
                             const nextPtr = await this.allocator.allocatePage(constants.BLOCK_TYPE.COLLECTION_PAGE);
                             page.setNextPage(nextPtr.blockId);
                             await page.save();
                             page = new Page(nextPtr.blockId, this.allocator);
                             page.add(entry.key, entry.type, entry.ptr);
                             this.col.tailPageId = page.id;
                         }
                    }
                    await page.save();
                    this.col.totalCount += items.length;
                    await this.col.saveHeader();
                }
                return;
            }

            // 2. Traversal
            let currentPageId = this.col.headPageId;
            let prevPageId = 0;
            let currentIndex = 0;
            
            while (currentPageId !== 0) {
                const page = new Page(currentPageId, this.allocator);
                await page.load();
                const countInPage = page.items.length;
                
                // Check if our operation starts in this page or at the very end of it
                if (currentIndex + countInPage >= start) {
                    const localStart = Math.max(0, start - currentIndex);
                    
                    // --- DELETION ---
                    let localDelete = 0;
                    if (deleteCount > 0) {
                        // How many can we delete from this page?
                        localDelete = Math.min(deleteCount, countInPage - localStart);
                        page.items.splice(localStart, localDelete);
                        deleteCount -= localDelete;
                        this.col.totalCount -= localDelete;
                    }

                    // --- INSERTION ---
                    // Only insert if this is the start page
                    if (newEntryPtrs.length > 0) {
                        // Insert into array at localStart
                        // We use spread to insert
                        page.items.splice(localStart, 0, ...newEntryPtrs);
                        this.col.totalCount += newEntryPtrs.length;
                        // Clear the array so we don't insert again in next loop
                        newEntryPtrs.length = 0;
                    }
                    
                    // --- SPLITTING (Mitosis) ---
                    // Check if page is overflowed
                    while (page.calcSize() > (constants.BLOCK_SIZE - HEADER_SIZE)) {
                         this.col.log(`Page ${page.id} overflow during splice. Splitting.`);
                         // Split logic: Move 2nd half to new page
                         const mid = Math.floor(page.items.length / 2);
                         const rightItems = page.items.splice(mid);
                         
                         const newPagePtr = await this.allocator.allocatePage(constants.BLOCK_TYPE.COLLECTION_PAGE);
                         const newPage = new Page(newPagePtr.blockId, this.allocator);
                         newPage.items = rightItems;
                         newPage.nextPageId = page.nextPageId;
                         newPage.isDirty = true;
                         
                         // Link current -> new
                         page.nextPageId = newPagePtr.blockId;
                         
                         // If we were tail, update tail
                         if (this.col.tailPageId === page.id) {
                             this.col.tailPageId = newPage.id;
                         }
                         
                         await newPage.save();
                    }

                    // --- EMPTY PAGE HANDLING ---
                    // If page is empty after delete (and no insert), unlink it
                    if (page.items.length === 0 && this.col.headPageId !== this.col.tailPageId) {
                         // Don't remove if it's the ONLY page (keep one empty page)
                         if (prevPageId !== 0) {
                             const prevPage = new Page(prevPageId, this.allocator);
                             await prevPage.load();
                             prevPage.setNextPage(page.nextPageId);
                             await prevPage.save();
                             
                             if (this.col.tailPageId === page.id) {
                                 this.col.tailPageId = prevPageId;
                             }
                             // TODO: Free page logic
                         } else {
                             // It's head. Move head.
                             this.col.headPageId = page.nextPageId;
                         }
                    } else {
                         page.isDirty = true;
                         await page.save();
                    }

                    if (deleteCount > 0) {
                         // Continue the loop.
                    } else {
                        // Done
                        break;
                    }
                }
                
                currentIndex += countInPage;
                prevPageId = currentPageId;
                currentPageId = page.nextPageId;
            }

            await this.col.saveHeader();
            return true;
        };
        this.col.writeLock = this.col.writeLock.then(task, task);
        return this.col.writeLock;
    }
}
module.exports = CollectionOps;