// B"H
const Page = require('../page.js');

class CollectionRead {
    constructor(collection) {
        this.col = collection;
        this.allocator = collection.allocator;
    }

    async getPage(pageIndex) {
         await this.col.load();
         let curr = this.col.headPageId;
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
    
    // B"H: Random Access by Index
    // Traverses the linked pages summing counts to find the specific item.
    // Returns { key, type, ptr }
    async getItem(index) {
        await this.col.load();
        if (index < 0 || index >= this.col.totalCount) return undefined;

        let curr = this.col.headPageId;
        let currentIndex = 0;
        
        while(curr !== 0) {
             const p = new Page(curr, this.allocator);
             await p.load();
             
             if (index < currentIndex + p.items.length) {
                 const localIndex = index - currentIndex;
                 return p.items[localIndex]; // returns { key, type, ptr }
             }
             
             currentIndex += p.items.length;
             curr = p.nextPageId;
        }
        return undefined;
    }
}
module.exports = CollectionRead;