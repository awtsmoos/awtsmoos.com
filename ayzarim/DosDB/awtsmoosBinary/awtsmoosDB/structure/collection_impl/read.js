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
}
module.exports = CollectionRead;