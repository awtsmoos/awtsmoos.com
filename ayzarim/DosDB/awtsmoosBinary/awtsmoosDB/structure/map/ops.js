
// B"H
const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');
const { readPointer48 } = require('../../utils/binaryHelpers.js');
const MapSplitOps = require('./ops_split.js');

class MapOps {
    constructor(engine) {
        this.engine = engine;
        this.nodeIO = engine.nodeIO;
        this.recursionDepth = 0;
        this.splitOps = new MapSplitOps(this);
    }

    _getPtrSize(ptrBuf) {
        const decoded = SmartPointer.decode(ptrBuf);
        if (!decoded) return 0;
        if (decoded.mode === constants.MODE_HEAP) return decoded.payload.readUInt32BE(10);
        if (decoded.mode === constants.MODE_BLOCK) return decoded.payload.readUInt32BE(6);
        if (decoded.mode === constants.MODE_INLINE) {
             if (decoded.type === constants.TYPE_STRING) return decoded.payload[0] + 1; 
             if (decoded.type === constants.TYPE_BOOLEAN) return 1;
             if (decoded.type === constants.TYPE_NUMBER) return 8;
             if (decoded.type === constants.TYPE_NULL || decoded.type === constants.TYPE_UNDEFINED) return 0;
             return decoded.payload.length;
        }
        return 0; 
    }

    async insert(node, keyBuf, valPtr, options = {}) {
        this.recursionDepth++;
        if (this.recursionDepth > 200) throw new Error("Stack Overflow in Map Insertion");

        try {
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
                    const oldValSize = this._getPtrSize(node.values[idx - 1]);
                    const newValSize = this._getPtrSize(valPtr);
                    if (!options.skipFree) {
                        try { await this.engine.allocator.free(node.values[idx - 1]); } catch(e){}
                    }
                    node.values[idx - 1] = valPtr;
                    node.totalBytes += (newValSize - oldValSize);
                    const newPtr = await this.nodeIO.save(node, node.selfPtr);
                    return { deltaCount: 0, deltaBytes: (newValSize - oldValSize), newPtr };
                }
                
                const keySize = keyBuf.length;
                const valSize = this._getPtrSize(valPtr);
                node.keys.splice(idx, 0, keyBuf); 
                node.values.splice(idx, 0, valPtr);
                node.totalCount += 1; node.totalBytes += (keySize + valSize);
                
                const split = await this.splitOps.checkSplit(node);
                let newPtr = null;
                if (!split) newPtr = await this.nodeIO.save(node, node.selfPtr);
                return { split, deltaCount: 1, deltaBytes: (keySize + valSize), newPtr };
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
                const res = await this.insert(child, keyBuf, valPtr, options);
                
                if (res.newPtr) {
                     const newChildBuf = SmartPointer.block(
                         constants.TYPE_MAP, res.newPtr.blockId, res.newPtr.length, res.newPtr.isChain, res.newPtr.offset
                     );
                     node.children[idx] = newChildBuf;
                }

                if (res.deltaCount !== 0 || res.deltaBytes !== 0) {
                    node.totalCount += res.deltaCount; node.totalBytes += res.deltaBytes;
                }
                
                if (res.split) {
                    return this.splitOps.handleSplit(node, idx, res.split);
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

    async delete(node, keyBuf) {
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
                await this.nodeIO.save(node, node.selfPtr);
            }
            return res;
        }
    }
}
module.exports = MapOps;
