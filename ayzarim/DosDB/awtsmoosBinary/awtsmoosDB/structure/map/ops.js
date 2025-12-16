
// B"H
const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');
const { readPointer48 } = require('../../utils/binaryHelpers.js');

// B"H: EXPANDED DISK STRUCTURE - Larger Nodes = Shorter Tree
const MAX_KEYS = 200; 

class MapOps {
    constructor(engine) {
        this.engine = engine;
        this.nodeIO = engine.nodeIO;
        this.recursionDepth = 0;
    }

    _getPtrSize(ptrBuf) {
        const decoded = SmartPointer.decode(ptrBuf);
        if (!decoded) return 0;
        
        if (decoded.mode === constants.MODE_HEAP) return decoded.payload.readUInt32BE(10);
        if (decoded.mode === constants.MODE_BLOCK) return decoded.payload.readUInt32BE(6);
        if (decoded.mode === constants.MODE_INLINE) {
             if (decoded.type === constants.TYPE_STRING) return decoded.payload[0];
             if (decoded.type === constants.TYPE_BOOLEAN) return 1;
             if (decoded.type === constants.TYPE_NUMBER) return 8;
             if (decoded.type === constants.TYPE_NULL || decoded.type === constants.TYPE_UNDEFINED) return 0;
             return decoded.payload.length;
        }
        return 0; 
    }

    async insert(node, keyBuf, valPtr, options = {}) {
        this.recursionDepth++;
        
        if (this.recursionDepth > 200) {
            console.error(`B"H Critical: Map Insertion Stack Overflow. Node: ID=${node.selfPtr.blockId} Off=${node.selfPtr.offset} Keys=${node.keys.length}`);
            throw new Error("Stack Overflow in Map Insertion");
        }

        try {
            // B"H: Binary Search on Buffer Keys
            let low = 0, high = node.keys.length - 1;
            let idx = node.keys.length;

            while (low <= high) {
                const mid = (low + high) >>> 1;
                const cmp = keyBuf.compare(node.keys[mid]);
                
                if (cmp === 0) {
                    idx = mid + 1; // Mark exact match position (1-based for consistent logic with children)
                    break;
                } else if (cmp < 0) {
                    idx = mid;
                    high = mid - 1;
                } else {
                    low = mid + 1;
                }
            }

            if (node.isLeaf) {
                // Exact match check
                if (idx > 0 && node.keys[idx - 1].compare(keyBuf) === 0) {
                    const oldValSize = this._getPtrSize(node.values[idx - 1]);
                    const newValSize = this._getPtrSize(valPtr);
                    const deltaBytes = newValSize - oldValSize;
                    
                    if (!options.skipFree) {
                        try { await this.engine.allocator.free(node.values[idx - 1]); } catch(e){}
                    }
                    
                    node.values[idx - 1] = valPtr;
                    node.totalBytes += deltaBytes;
                    
                    const newPtr = await this.nodeIO.save(node, node.selfPtr);
                    return { deltaCount: 0, deltaBytes, newPtr };
                }
                
                // No match, insert at idx
                const keySize = keyBuf.length;
                const valSize = this._getPtrSize(valPtr);
                
                node.keys.splice(idx, 0, keyBuf); 
                node.values.splice(idx, 0, valPtr);
                
                const deltaBytes = keySize + valSize;
                node.totalCount += 1; node.totalBytes += deltaBytes;
                
                const split = await this._checkSplit(node);
                let newPtr = null;
                if (!split) {
                    newPtr = await this.nodeIO.save(node, node.selfPtr);
                }
                
                return { split, deltaCount: 1, deltaBytes, newPtr };
            } else {
                // Internal Node
                const childPtrBuf = node.children[idx];
                const decoded = SmartPointer.decode(childPtrBuf);
                const childPtr = {
                    blockId: readPointer48(decoded.payload, 0),
                    length: decoded.payload.readUInt32BE(6),
                    offset: decoded.payload.readUInt32BE(10),
                    isChain: decoded.payload.readUInt8(14) === 1
                };
                
                const child = await this.nodeIO.load(childPtr);
                const res = await this.insert(child, keyBuf, valPtr, options);
                
                if (res.newPtr) {
                     const newChildBuf = SmartPointer.block(
                         constants.TYPE_MAP, 
                         res.newPtr.blockId, 
                         res.newPtr.length, 
                         res.newPtr.isChain, 
                         res.newPtr.offset
                     );
                     node.children[idx] = newChildBuf;
                }

                if (res.deltaCount !== 0 || res.deltaBytes !== 0) {
                    node.totalCount += res.deltaCount; node.totalBytes += res.deltaBytes;
                }
                
                if (res.split) {
                    return this._handleSplit(node, idx, res.split);
                } else {
                    if (res.deltaCount !== 0 || res.deltaBytes !== 0 || res.newPtr) {
                         const newPtr = await this.nodeIO.save(node, node.selfPtr);
                         return { ...res, newPtr };
                    }
                    return res;
                }
            }
        } finally {
            this.recursionDepth--;
        }
    }

    // B"H: New return format { success: bool, deletedPtr: Buffer }
    async delete(node, keyBuf) {
        // Binary Search
        let low = 0, high = node.keys.length - 1, idx = node.keys.length;
        while (low <= high) {
            const mid = (low + high) >>> 1;
            const cmp = keyBuf.compare(node.keys[mid]);
            if (cmp === 0) { idx = mid + 1; break; }
            if (cmp < 0) { idx = mid; high = mid - 1; }
            else { low = mid + 1; }
        }

        if (node.isLeaf) {
            if (idx > 0 && node.keys[idx - 1].compare(keyBuf) === 0) {
                const keySize = node.keys[idx-1].length;
                const valSize = this._getPtrSize(node.values[idx-1]);
                const deltaBytes = -(keySize + valSize);
                
                node.keys.splice(idx - 1, 1);
                const removedVals = node.values.splice(idx - 1, 1);
                const deletedPtr = removedVals[0];
                
                // Do NOT free here. We return it so Caller (Writer) can invoke graph cleanup first.
                // Caller is responsible for freeing.
                
                node.totalCount -= 1; node.totalBytes += deltaBytes;
                await this.nodeIO.save(node, node.selfPtr);
                
                return { success: true, deletedPtr, deltaCount: -1, deltaBytes };
            }
            return { success: false };
        } else {
            const childPtrBuf = node.children[idx];
            const decoded = SmartPointer.decode(childPtrBuf);
            const childPtr = {
                blockId: readPointer48(decoded.payload, 0),
                length: decoded.payload.readUInt32BE(6),
                offset: decoded.payload.readUInt32BE(10),
                isChain: decoded.payload.readUInt8(14) === 1
            };
            
            const child = await this.nodeIO.load(childPtr);
            const res = await this.delete(child, keyBuf);
            
            if (res.success) {
                node.totalCount += res.deltaCount;
                node.totalBytes += res.deltaBytes;
                // Save parent to update stats
                await this.nodeIO.save(node, node.selfPtr);
            }
            return res;
        }
    }

    async _checkSplit(node) {
        if (node.keys.length <= MAX_KEYS) {
            return null;
        }
        
        const mid = Math.floor(node.keys.length / 2);
        const rightKeys = node.keys.splice(mid);
        let splitKey;
        const sibling = { isLeaf: node.isLeaf, keys: [], values: [], children: [], next: 0, totalCount: 0, totalBytes: 0 };

        if (node.isLeaf) {
            splitKey = rightKeys[0];
            sibling.keys = rightKeys; 
            sibling.values = node.values.splice(mid);
            sibling.next = node.next;
            await this._recalcStats(node); await this._recalcStats(sibling);
        } else {
            splitKey = rightKeys.shift();
            sibling.keys = rightKeys; 
            sibling.children = node.children.splice(mid + 1);
            await this._sumChildrenStats(node); await this._sumChildrenStats(sibling);
        }
        
        const sibPtr = await this.nodeIO.save(sibling);
        
        if (node.isLeaf) node.next = sibPtr.blockId; 
        
        const newSelfPtr = await this.nodeIO.save(node, node.selfPtr);
        
        return { 
            key: splitKey, 
            ptr: SmartPointer.block(constants.TYPE_MAP, sibPtr.blockId, sibPtr.length, sibPtr.isChain, sibPtr.offset),
            nodePtr: newSelfPtr
        };
    }

    async _recalcStats(leaf) {
        leaf.totalCount = leaf.keys.length; leaf.totalBytes = 0;
        for(let i=0; i<leaf.keys.length; i++) {
            leaf.totalBytes += leaf.keys[i].length; // key is Buffer
            leaf.totalBytes += this._getPtrSize(leaf.values[i]);
        }
    }

    async _sumChildrenStats(internal) {
        internal.totalCount = 0; internal.totalBytes = 0;
        for(const childPtrBuf of internal.children) {
            const decoded = SmartPointer.decode(childPtrBuf);
            const childPtr = {
                blockId: readPointer48(decoded.payload, 0),
                length: decoded.payload.readUInt32BE(6),
                offset: decoded.payload.readUInt32BE(10),
                isChain: decoded.payload.readUInt8(14) === 1
            };
            
            // Note: This loads children to recalc stats. 
            // In a highly optimized engine, we would cache stats in the parent key entry.
            // For now, this is acceptable during splits (infrequent).
            const child = await this.nodeIO.load(childPtr);
            internal.totalCount += child.totalCount; internal.totalBytes += child.totalBytes;
        }
    }

    async _handleSplit(node, idx, split) {
        node.keys.splice(idx, 0, split.key);
        node.children.splice(idx + 1, 0, split.ptr);
        
        if (split.nodePtr) {
            node.children[idx] = SmartPointer.block(
                constants.TYPE_MAP,
                split.nodePtr.blockId,
                split.nodePtr.length,
                split.nodePtr.isChain,
                split.nodePtr.offset
            );
        }

        const res = await this._checkSplit(node);
        
        let newPtr = null;
        if (res) {
             return { split: res, deltaCount: 0, deltaBytes: 0, newPtr };
        } else {
             newPtr = await this.nodeIO.save(node, node.selfPtr);
        }

        return { split: null, deltaCount: 0, deltaBytes: 0, newPtr };
    }
}
module.exports = MapOps;
