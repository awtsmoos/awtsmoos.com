// B"H
const Page = require('./page.js');
const constants = require('../constants.js');
const serializeValue = require('../serialize/serializeValue.js');
const IndexManager = require('./indexManager.js');

// Inline helper to ensure correctness without external deps
function writePtr(buf, val, offset) {
    // 48-bit write: High 16 bits, Low 32 bits
    const high = Math.floor(val / 0xFFFFFFFF);
    const low = val % 0xFFFFFFFF;
    buf.writeUInt16BE(high, offset);
    buf.writeUInt32BE(low, offset + 2);
}

function readPtr(buf, offset) {
    const high = buf.readUInt16BE(offset);
    const low = buf.readUInt32BE(offset + 2);
    // Recombine (multiply by 2^32)
    return (high * 0x100000000) + low;
}

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

    log(msg) {
        // console.log(`[Collection #${this.headerId}] ${msg}`);
    }

    async append(key, value) {
	    const task = async () => {
            this.log(`Append "${key}"`);
            await this.load(); 
	
	        const valData = serializeValue(value, false);
	        const dataPtr = await this.allocator.allocate(valData.data.length);
	        
            // Write data
	        if (dataPtr.isChain) {
	             let remaining = valData.data;
	             let currentBlock = dataPtr.blockId;
	             while(remaining.length > 0) {
	                 const blk = await this.allocator.pager.readBlock(currentBlock);
	                 const start = (currentBlock === dataPtr.blockId) ? dataPtr.offset : constants.UNIT_SIZE;
	                 const avail = constants.BLOCK_SIZE - start;
	                 const chunk = Math.min(remaining.length, avail);
	                 remaining.subarray(0, chunk).copy(blk, start);
	                 await this.allocator.pager.writeBlock(currentBlock, blk);
	                 remaining = remaining.subarray(chunk);
	                 currentBlock++; 
	             }
	        } else {
	            let block = await this.allocator.pager.readBlock(dataPtr.blockId);
	            valData.data.copy(block, dataPtr.offset);
	            await this.allocator.pager.writeBlock(dataPtr.blockId, block);
	        }
	
	        let page;
	        if (this.tailPageId === 0) {
	            const newPagePtr = await this.allocator.allocate(constants.BLOCK_SIZE);
	            this.headPageId = newPagePtr.blockId;
	            this.tailPageId = newPagePtr.blockId;
	            page = new Page(this.tailPageId, this.allocator);
                // Do NOT save here. Atomic save at end.
	        } else {
	            page = new Page(this.tailPageId, this.allocator);
	            await page.load();
	        }
	
	        const added = page.add(key, valData.type, dataPtr);
	        if (!added) {
	            const newPagePtr = await this.allocator.allocate(constants.BLOCK_SIZE);
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
	
            // Force Save Header
            await this.saveHeader();

	        if (typeof value === 'object' && value !== null) {
	            this.indexManager.indexObject(dataPtr, value);
                await this.indexManager.queue;
	        }

            return dataPtr;
        };
        
        this.writeLock = this.writeLock.then(task, task);
        return this.writeLock;
    }
    
    async getPage(pageIndex) {
        await this.load();
        let currentPageId = this.headPageId;
        let currentIndex = 0;

        while (currentPageId !== 0) {
            if (currentIndex === pageIndex) {
                const page = new Page(currentPageId, this.allocator);
                await page.load();
                return page.items; 
            }
            const page = new Page(currentPageId, this.allocator);
            await page.load();
            currentPageId = page.nextPageId;
            currentIndex++;
        }
        return []; 
    }

	async delete(key, resolvePointerFn) { 
	    const task = async () => {
	            await this.load();
	            let pageId = this.headPageId;
	            let prevPageId = 0; 
	            
	            while (pageId !== 0) {
	                const page = new Page(pageId, this.allocator);
	                await page.load();
	        
	                const index = page.items.findIndex(item => item.key === key);
	                
	                if (index !== -1) {
	                    const item = page.items[index];
	                    if (resolvePointerFn) {
	                        try {
	                            const obj = await resolvePointerFn(item.ptr, item.type);
	                            if (obj && typeof obj === 'object') await this.indexManager.deleteObject(obj);
	                        } catch (e) {}
	                    }
	                
	                    await this.allocator.free(item.ptr);
	                    page.items.splice(index, 1);
	                    
                        if (page.items.length === 0 && pageId !== this.headPageId && pageId !== this.tailPageId) {
                             if (prevPageId !== 0) {
                                 const prevPage = new Page(prevPageId, this.allocator);
                                 await prevPage.load();
                                 prevPage.nextPageId = page.nextPageId;
                                 await prevPage.save();
                                 await this.allocator.free({ blockId: pageId, offset: 0, length: constants.BLOCK_SIZE });
                                 this.totalCount--;
                                 await this.saveHeader();
                                 return true;
                             }
                        }

	                    page.isDirty = true;
	                    await page.save();
	                    this.totalCount--;
	                    await this.saveHeader();
	                    return true;
	                }
	                
	                prevPageId = pageId;
	                pageId = page.nextPageId;
	            }
	            return false;
	        };
	
	        this.writeLock = this.writeLock.then(task, task);
	        return this.writeLock;
	}
    
    /**
     * Reads the Collection State from the Header Block (ID=1).
     * Structure: [Header 32B] [HeadPtr 6B] [TailPtr 6B] [Count 4B] [RegistryFlag 1B] [RegistryPtr 15B]
     */
	async load() {
	    const buffer = await this.allocator.pager.readBlock(this.headerId);
	    if (!buffer) throw new Error(`B"H: Collection Header ${this.headerId} not found`);
	    
        // HARDCODED OFFSET: 32 (Standard Unified Block Header Size)
	    let offset = 32; 
	    this.headPageId = readPtr(buffer, offset); offset += 6;
	    this.tailPageId = readPtr(buffer, offset); offset += 6;
	    this.totalCount = buffer.readUInt32BE(offset); offset += 4;
	    
	    const hasRegistry = buffer.readUInt8(offset); offset++;
	    if (hasRegistry === 1) {
	        const b = readPtr(buffer, offset); offset += 6;
	        const o = buffer.readUInt32BE(offset); offset += 4;
	        const l = buffer.readUInt32BE(offset); offset += 4;
	        const c = buffer.readUInt8(offset); offset++;
	        this.registryPtr = { blockId: b, offset: o, length: l, isChain: c === 1 };
	    } else {
	        this.registryPtr = null;
	    }
	    await this.indexManager.load(this.registryPtr);
	}
	
	async saveHeader() {
	    const buffer = await this.allocator.pager.readBlock(this.headerId);
	    
        // HARDCODED OFFSET: 32
	    let offset = 32;
	    writePtr(buffer, this.headPageId, offset); offset += 6;
	    writePtr(buffer, this.tailPageId, offset); offset += 6;
	    buffer.writeUInt32BE(this.totalCount, offset); offset += 4;
	    
	    if (this.indexManager.registryPtr) {
	        const ptr = this.indexManager.registryPtr;
	        buffer.writeUInt8(1, offset); offset++; 
	        writePtr(buffer, ptr.blockId, offset); offset += 6;
	        buffer.writeUInt32BE(ptr.offset, offset); offset += 4;
	        buffer.writeUInt32BE(ptr.length, offset); offset += 4;
	        buffer.writeUInt8(ptr.isChain ? 1 : 0, offset); offset++;
	    } else {
	        buffer.writeUInt8(0, offset); 
	    }

        // Diagnostic Log: Verify buffer content before write
        // console.log(`[SaveHeader] Writing Block ${this.headerId}. Offset 32 hex: ${buffer.subarray(32, 40).toString('hex')}`);

	    await this.allocator.pager.writeBlock(this.headerId, buffer);
	}
	
	async getSortedPage(sortKey, pageIndex, pageSize=100) {
	    const tree = this.indexManager.indexes.get(sortKey);
	    if (!tree) return await this.getPage(pageIndex); 
	    const startRank = pageIndex * pageSize;
	    return await tree.getRange(startRank, pageSize);
	}
}

module.exports = Collection;