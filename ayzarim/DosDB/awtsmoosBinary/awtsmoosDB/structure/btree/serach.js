// B"H
class Search {
    constructor(btree) {
        this.btree = btree;
    }

    async search(key) {
        const root = await this.btree.getRoot();
        return await this.searchRecursive(root, key);
    }

    async searchRecursive(node, key) {
        if (node.isLeaf) {
            const idx = node.keys.indexOf(key);
            if (idx !== -1) {
                return node.values[idx];
            }
            return null;
        }

        let idx = 0;
        while (idx < node.keys.length && key >= node.keys[idx]) idx++;
        
        const childPtr = node.children[idx];
        const childNode = await this.btree.loadNode(childPtr);
        
        return await this.searchRecursive(childNode, key);
    }
    
    async getRange(startRank, limit) {
	    const root = await this.btree.getRoot();
	    const results = [];
	    await this.collectRange(root, startRank, limit, results, 0);
	    return results;
	}
	
	async collectRange(node, startRank, limit, results, currentOffset) {
	    if (results.length >= limit) return; 
	
	    if (node.isLeaf) {
            let localIdx = 0;
            if (startRank > currentOffset) {
                localIdx = startRank - currentOffset;
            }
            if (localIdx < 0) localIdx = 0;

            while (localIdx < node.keys.length && results.length < limit) {
                results.push({
                    key: node.keys[localIdx],
                    ptr: node.values[localIdx]
                });
                localIdx++;
            }
	        return;
	    }
	
	    let accumulator = currentOffset;
	    for (let i = 0; i < node.children.length; i++) {
            if (results.length >= limit) return;
            
	        const childPtr = node.children[i];
	        const childNode = await this.btree.loadNode(childPtr);
	        const childCount = childNode.count;
            const childEnd = accumulator + childCount;
	        
            if (startRank === 0 || childEnd > startRank) {
                await this.collectRange(childNode, startRank, limit, results, accumulator);
            }
	        
	        accumulator += childCount;
	    }
	}
}

module.exports = Search;
