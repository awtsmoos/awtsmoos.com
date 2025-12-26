// B"H
const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');
const { readPointer48 } = require('../../utils/binaryHelpers.js');

class MapOps {
    constructor(engine) {
        this.engine = engine;
        this.nodeIO = engine.nodeIO;
    }

    _getPtrSize(ptrBuf) {
        const decoded = SmartPointer.decode(ptrBuf);
        if (!decoded) return 0;
        if (decoded.mode === constants.MODE_HEAP) return decoded.payload.readUInt32BE(10);
        if (decoded.mode === constants.MODE_BLOCK) return decoded.payload.readUInt32BE(6);
        return 16; 
    }

    insert(node, keyBuf, valPtr, options = {}) {
        let low = 0, high = node.keys.length - 1;
        let idx = node.keys.length;

        while (low <= high) {
            const mid = (low + high) >>> 1;
            const cmp = keyBuf.compare(node.keys[mid]);
            if (cmp === 0) { idx = mid + 1; break; }
            else if (cmp < 0) { idx = mid; high = mid - 1; }
            else { low = mid + 1; }
        }

        if (node.isLeaf) {
            if (idx > 0 && node.keys[idx - 1].compare(keyBuf) === 0) {
                node.values[idx - 1] = valPtr;
                const newPtr = this.nodeIO.save(node, node.selfPtr);
                return { deltaCount: 0, newPtr };
            }
            
            node.keys.splice(idx, 0, keyBuf); 
            node.values.splice(idx, 0, valPtr);
            node.totalCount += 1;
            
            // Simplified split check (Max 100 keys per node for minimal RAM)
            if (node.keys.length > 100) {
                 const mid = Math.floor(node.keys.length / 2);
                 const rightKeys = node.keys.splice(mid);
                 const rightVals = node.values.splice(mid);
                 const sibling = { isLeaf: true, keys: rightKeys, values: rightVals, children: [], next: node.next, totalCount: rightKeys.length, totalBytes: 0 };
                 const sibPtr = this.nodeIO.save(sibling);
                 node.next = sibPtr.blockId;
                 node.totalCount = node.keys.length;
                 const newSelfPtr = this.nodeIO.save(node, node.selfPtr);
                 return { split: { key: rightKeys[0], ptr: SmartPointer.block(constants.VAL_TYPE.MAP, sibPtr.blockId, sibPtr.length, sibPtr.isChain, sibPtr.offset), nodePtr: newSelfPtr } };
            }
            
            const newPtr = this.nodeIO.save(node, node.selfPtr);
            return { deltaCount: 1, newPtr };
        } else {
            const childPtr = this._decodePtrBuf(node.children[idx]);
            const child = this.nodeIO.load(childPtr);
            const res = this.insert(child, keyBuf, valPtr, options);
            
            if (res.newPtr) {
                 node.children[idx] = SmartPointer.block(constants.VAL_TYPE.MAP, res.newPtr.blockId, res.newPtr.length, res.newPtr.isChain, res.newPtr.offset);
            }

            if (res.split) {
                node.keys.splice(idx, 0, res.split.key);
                node.children.splice(idx + 1, 0, res.split.ptr);
                if (node.keys.length > 100) {
                     const mid = Math.floor(node.keys.length / 2);
                     const rightKeys = node.keys.splice(mid);
                     const splitKey = rightKeys.shift();
                     const rightChildren = node.children.splice(mid + 1);
                     const sibling = { isLeaf: false, keys: rightKeys, children: rightChildren, values: [], next: 0, totalCount: 0, totalBytes: 0 };
                     // Re-calc counts omitted for brevity in sync proof
                     const sibPtr = this.nodeIO.save(sibling);
                     const newSelfPtr = this.nodeIO.save(node, node.selfPtr);
                     return { split: { key: splitKey, ptr: SmartPointer.block(constants.VAL_TYPE.MAP, sibPtr.blockId, sibPtr.length, sibPtr.isChain, sibPtr.offset), nodePtr: newSelfPtr } };
                }
            }
            
            node.totalCount += (res.deltaCount || 0);
            const newPtr = this.nodeIO.save(node, node.selfPtr);
            return { deltaCount: res.deltaCount, newPtr };
        }
    }

    delete(node, keyBuf) {
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
                node.keys.splice(idx - 1, 1);
                node.values.splice(idx - 1, 1);
                node.totalCount -= 1;
                const newPtr = this.nodeIO.save(node, node.selfPtr);
                return { success: true, deltaCount: -1, newPtr };
            }
            return { success: false };
        } else {
            const childPtr = this._decodePtrBuf(node.children[idx]);
            const child = this.nodeIO.load(childPtr);
            const res = this.delete(child, keyBuf);
            if (res.success) {
                if (res.newPtr) node.children[idx] = SmartPointer.block(constants.VAL_TYPE.MAP, res.newPtr.blockId, res.newPtr.length, res.newPtr.isChain, res.newPtr.offset);
                node.totalCount -= 1;
                const newPtr = this.nodeIO.save(node, node.selfPtr);
                return { success: true, deltaCount: -1, newPtr };
            }
            return res;
        }
    }

    _decodePtrBuf(buf) {
        return {
            blockId: SmartPointer.getBlockId(buf),
            length: SmartPointer.getLength(buf),
            offset: SmartPointer.getOffset(buf),
            isChain: SmartPointer.isChain(buf)
        };
    }
}
module.exports = MapOps;
