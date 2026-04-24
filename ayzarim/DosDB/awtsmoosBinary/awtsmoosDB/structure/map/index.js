
// B"H
/**
 * @file index.js (MapEngine)
 * @class MapEngine
 * @description
 *  =============================================================================
 *  CHAPTER 15: THE B-TREE OF LIFE (ETZ CHAYIM) AND THE CONTINUOUS CREATION
 *  =============================================================================
 *  "Forever, O Lord, Your word stands firm in the heavens." (Psalms 119:89)
 *
 *  The Awtsmoos (Essence) is not merely the source of biological life, but of all
 *  inorganic existence as well. Even a simple stone ("Even" - Aleph-Beis-Nun)
 *  exists only because the original Ten Statements of Creation are constantly
 *  being permuted.
 *
 *  THE TIKKUN OF VARINT AWARENESS: 
 *  We have updated the constructor to rely purely on `SmartPointer.decode` 
 *  rather than arbitrary byte-length checks, ensuring even a 2-byte seal 
 *  is properly identified and hydrated.
 */
const constants = require('../../constants.js');
const MapNode = require('./node.js');
const MapOps = require('./ops/index.js');
const Search = require('./ops/search.js');
const SmartPointer = require('../../utils/smartPointer.js');
const keyEncoding = require('../../utils/keyEncoding.js');

class MapEngine {
    /**
     * @constructor
     * @param {Object} allocator - The Provider of Space (Chesed).
     * @param {Buffer|Object} ptr - The SmartPointer coordinating the Map's physical root.
     */
    constructor(allocator, ptr = null) {
        this.allocator = allocator;
        this.v1 = allocator?.v1 || allocator;
        this.db = this.v1?.db || (allocator?.db ? allocator.db : null);
        
        if (Buffer.isBuffer(ptr)) {
            const dec = SmartPointer.decode(ptr);
            if (dec) {
                this.ptr = { isStructure: true, type: dec.type, offset: dec.offset, length: dec.length, ptr };
            } else {
                this.ptr = ptr;
            }
        } else {
            this.ptr = ptr || null;
        }
        
        if (this.ptr) this.ptr.type = constants.VAL_TYPE.MAP;
        this.nodeIO = new MapNode(this.v1, this);
        this.ops = new MapOps(this);
    }

    /**
     * @method create
     * @description
     *  Emanates a completely new Map from the Void.
     *  Speaks the first empty leaf node into physical disk space.
     * @returns {Buffer} The VarInt SmartPointer seal of the new Map.
     */
    create() {
        const node = { isLeaf: true, keys: [], values: [], children: [], totalCount: 0, totalBytes: 0 };
        const ptr = this.nodeIO.save(node);
        this.ptr = { ...ptr, type: constants.VAL_TYPE.MAP };
        return SmartPointer.encode(constants.VAL_TYPE.MAP, this.ptr.offset, this.ptr.length);
    }

    /**
     * @method set
     * @description
     *  Breathes a new key-value pair into the B-Tree. If the vessel overflows,
     *  it shatters and splits (Mitosis), expanding the structure of reality.
     * @returns {number} The delta count (1 if new, 0 if overwritten).
     */
    set(key, value, options = {}) {
        const valPtr = (options.isPtr) ? value : this.db.allocator.save(value);
        const keyBuf = Buffer.isBuffer(key) ? key : keyEncoding.encode(key);
        
        let root = this.nodeIO.load(this.ptr);
        if (!root) {
            this.create();
            root = this.nodeIO.load(this.ptr);
        }
        
        const res = this.ops.insert(root, keyBuf, valPtr, options);
        let delta = res ? res.deltaCount : 0;
        
        if (res && res.split) {
            const split = res.split;
            const leftChildPtr = split.nodePtr || this.ptr;
            leftChildPtr.type = constants.VAL_TYPE.MAP;
            const newRoot = {
                isLeaf: false,
                keys: [split.key],
                children: [
                    SmartPointer.toBuffer(leftChildPtr),
                    SmartPointer.toBuffer(split.ptr)
                ],
                values: [], totalCount: (root.totalCount || 0) + 1
            };
            this.ptr = { ...this.nodeIO.save(newRoot), type: constants.VAL_TYPE.MAP };
        } else if (res && res.newPtr) {
            this.ptr = { ...res.newPtr, type: constants.VAL_TYPE.MAP };
        }
        
        return delta;
    }

    /**
     * @method delete
     * @description
     *  The act of Histalkus (Withdrawal). Removes a key-value spark from the Map.
     */
    delete(key) {
        const keyBuf = Buffer.isBuffer(key) ? key : keyEncoding.encode(key);
        let root = this.nodeIO.load(this.ptr);
        if (!root) return { success: false };
        
        const res = this.ops.delete(root, keyBuf);
        if (res && res.success && res.newPtr) {
            this.ptr = { ...res.newPtr, type: constants.VAL_TYPE.MAP };
        }
        return res || { success: false };
    }

    /**
     * @method getPtr
     * @description Navigates the B-Tree to find the physical pointer of a key.
     */
    getPtr(key) {
        let currPtr = this.ptr;
        const keyBuf = Buffer.isBuffer(key) ? key : keyEncoding.encode(key);
        
        while (currPtr && currPtr.offset !== undefined) {
            const node = this.nodeIO.load(currPtr);
            if (!node) break;
            
            const { index, found } = Search.findKey(node, keyBuf);
            if (node.isLeaf) {
                return found ? node.values[index] : undefined;
            }
            
            let childIdx = found ? index + 1 : index;
            const childSeal = node.children[childIdx];
            currPtr = SmartPointer.resolve(childSeal, this.allocator);
        }
        return undefined;
    }

    /**
     * @method get
     * @description Navigates the B-Tree and fully hydrates the resulting value.
     */
    get(key, ctx) {
        const ptr = this.getPtr(key);
        return ptr ? SmartPointer.resolve(ptr, this.allocator, ctx) : undefined;
    }

    * range(start, end) {
        const startBuf = start ? keyEncoding.encode(start) : null;
        const endBuf = end ? keyEncoding.encode(end) : null;
        yield* this._iterateNodeRaw(this.ptr, startBuf, endBuf);
    }

    * iterateRaw() {
        if (!this.ptr || this.ptr.offset === undefined) return;
        yield* this._iterateNodeRaw(this.ptr, null, null);
    }

    * _iterateNodeRaw(ptr, startBuf, endBuf) {
        const node = this.nodeIO.load(ptr);
        if (!node) return;
        
        if (node.isLeaf) {
            for (let i = 0; i < node.keys.length; i++) {
                const key = node.keys[i];
                const startCmp = startBuf ? key.compare(startBuf) : 0;
                const endCmp = endBuf ? key.compare(endBuf) : 0;
                if (startCmp >= 0 && endCmp <= 0) {
                    yield { key, ptr: node.values[i] };
                }
            }
        } else {
            for (let i = 0; i < node.children.length; i++) {
                const childAddr = SmartPointer.resolve(node.children[i], this.allocator);
                if (childAddr) yield* this._iterateNodeRaw(childAddr, startBuf, endBuf);
            }
        }
    }
}

module.exports = MapEngine;
