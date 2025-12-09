// B"H
class Ops {
    constructor(btree) {
        this.btree = btree;
    }

    async insert(key, valuePtr) {
        const root = await this.btree.getRoot();
        const oldRootPtr = this.btree.rootPtr; // Capture state

        const result = await this.insertRecursive(root, key, valuePtr);
        
        if (result.newPtr) {
            // B"H: CoW Update - The old root node is replaced by a new one.
            // We must free the old root, BUT only if it actually changed block/offset.
            if (oldRootPtr && result.newPtr && (oldRootPtr.blockId !== result.newPtr.blockId || oldRootPtr.offset !== result.newPtr.offset)) {
                 this.btree.registerFree(oldRootPtr);
            }
            this.btree.rootPtr = result.newPtr;
        }

        if (result.newChild) {
            this.btree.log(`Root Split. New Root created.`);
            // B"H: Root Split - The old root (this.btree.rootPtr) becomes a child.
            // DO NOT FREE IT.
            const newRoot = {
                isLeaf: false,
                keys: [result.newChild.key],
                children: [this.btree.rootPtr, result.newChild.ptr], 
                values: [],
                count: (root.count || 0) + (await this.btree.getSubtreeCount(result.newChild.ptr))
            };
            this.btree.rootPtr = await this.btree.saveNode(newRoot);
        }
    }

    async insertRecursive(node, key, valuePtr) {
	    if (node.isLeaf) {
	            let idx = 0;
	            while (idx < node.keys.length && key > node.keys[idx]) idx++;
	            
                if (idx < node.keys.length && node.keys[idx] === key) {
                    node.values[idx] = valuePtr;
                    const savedPtr = await this.btree.saveNode(node);
                    return { newChild: null, newPtr: savedPtr };
                }

	            node.keys.splice(idx, 0, key);
	            node.values.splice(idx, 0, valuePtr);
	            node.count = (node.count || 0) + 1;
	            
	            if (node.keys.length > this.btree.order) {
	                return await this.splitLeaf(node);
	            }
	
	            const savedPtr = await this.btree.saveNode(node);
	            return { newChild: null, newPtr: savedPtr };
	    } 
	    
	    let idx = 0;
	    while (idx < node.keys.length && key >= node.keys[idx]) idx++;
	    
        if (idx >= node.children.length) {
             throw new Error(`BTree Integrity Error: Index ${idx} out of bounds`);
        }

	    const childPtr = node.children[idx];
	    const childNode = await this.btree.loadNode(childPtr);
	    
	    const result = await this.insertRecursive(childNode, key, valuePtr);
	    
        if (result.newPtr) node.children[idx] = result.newPtr;

	    if (result.newChild) {
	        node.keys.splice(idx, 0, result.newChild.key);
	        node.children.splice(idx + 1, 0, result.newChild.ptr);
            node.count = await this.btree.sumChildren(node.children);
	
	        if (node.children.length > this.btree.order + 1) {
                const splitRes = await this.splitInternal(node);
                 if (result.newPtr && childPtr && (result.newPtr.blockId !== childPtr.blockId || result.newPtr.offset !== childPtr.offset)) {
                    // B"H: Defer free
                    this.btree.registerFree(childPtr);
                }
	            return splitRes;
	        } else {
	            const savedPtr = await this.btree.saveNode(node);
                if (result.newPtr && childPtr && (result.newPtr.blockId !== childPtr.blockId || result.newPtr.offset !== childPtr.offset)) {
                    // B"H: Defer free
                    this.btree.registerFree(childPtr);
                }
	            return { newChild: null, newPtr: savedPtr };
	        }
	    } else {
	        node.count = await this.btree.sumChildren(node.children);
	        const savedPtr = await this.btree.saveNode(node);
            if (result.newPtr && childPtr && (result.newPtr.blockId !== childPtr.blockId || result.newPtr.offset !== childPtr.offset)) {
                // B"H: Defer free
                this.btree.registerFree(childPtr);
            }
	        return { newChild: null, newPtr: savedPtr };
	    }
	}

    async splitLeaf(node) {
        const mid = Math.floor(node.keys.length / 2);
        const siblingKeys = node.keys.splice(mid);
        const siblingValues = node.values.splice(mid);

        const sibling = {
            isLeaf: true,
            keys: siblingKeys,
            values: siblingValues,
            children: [],
            count: siblingKeys.length
        };
        node.count = node.keys.length;

        const sibPtr = await this.btree.saveNode(sibling);
        const nodePtr = await this.btree.saveNode(node); 
        node.ptr = nodePtr;

        return { newChild: { key: sibling.keys[0], ptr: sibPtr }, newPtr: nodePtr };
    }

    async splitInternal(node) {
        const mid = Math.floor(node.keys.length / 2);
        const upKey = node.keys[mid];
        const siblingKeys = node.keys.splice(mid + 1);
        node.keys.pop(); // Remove upKey

        const siblingChildren = node.children.splice(mid + 1);
        const sibling = {
            isLeaf: false,
            keys: siblingKeys,
            children: siblingChildren,
            values: [],
            count: 0
        };
        
        sibling.count = await this.btree.sumChildren(sibling.children);
        node.count = await this.btree.sumChildren(node.children);

        const sibPtr = await this.btree.saveNode(sibling);
        const nodePtr = await this.btree.saveNode(node);
        node.ptr = nodePtr;

        return { newChild: { key: upKey, ptr: sibPtr }, newPtr: nodePtr };
    }

    async remove(key) {
	    const root = await this.btree.getRoot();
        const oldRootPtr = this.btree.rootPtr;

	    const result = await this.removeRecursive(root, key);
	    if (result.modified) {
             if (oldRootPtr && result.newPtr && (oldRootPtr.blockId !== result.newPtr.blockId || oldRootPtr.offset !== result.newPtr.offset)) {
                 this.btree.registerFree(oldRootPtr);
            }
            this.btree.rootPtr = result.newPtr;
	    }
	}
	
	async removeRecursive(node, key) {
	    if (node.isLeaf) {
	        const idx = node.keys.indexOf(key);
	        if (idx !== -1) {
	            node.keys.splice(idx, 1);
	            node.values.splice(idx, 1);
	            node.count--;
	            
	            const savedPtr = await this.btree.saveNode(node);
	            return { modified: true, newPtr: savedPtr, countDelta: -1 };
	        }
	        return { modified: false, countDelta: 0 };
	    }
	
	    let idx = 0;
	    while (idx < node.keys.length && key >= node.keys[idx]) idx++;
	    
	    const childPtr = node.children[idx]; 
	    const childNode = await this.btree.loadNode(childPtr);
	    
	    const result = await this.removeRecursive(childNode, key);
	    
	    if (result.modified) {
	        node.children[idx] = result.newPtr;
	        node.count += result.countDelta;
	        const savedPtr = await this.btree.saveNode(node);
            
            if (result.newPtr && childPtr && (result.newPtr.blockId !== childPtr.blockId || result.newPtr.offset !== childPtr.offset)) {
                // B"H: Defer free
                this.btree.registerFree(childPtr);
            }
	        return { modified: true, newPtr: savedPtr, countDelta: result.countDelta };
	    }
	    return { modified: false, countDelta: 0 };
	}
}

module.exports = Ops;