// B"H
/**
 * @file index.js (MapEngine)
 * @description 
 *  The Scribe of the B-Tree Map — Organizing the knowledge into a balanced structure.
 * 
 *  REWRITTEN: Added 'range' method and authoritative type-tagging to solve 
 *  the "TypeError: map.range is not a function" error.
 */

const constants = require('../../constants.js');
const MapNode = require('./node.js');
const MapOps = require('./ops.js');
const SmartPointer = require('../../utils/smartPointer.js');
const fs = require('fs');

class MapEngine {
    constructor(allocator, ptr = null) {
        this.allocator = allocator;
        this.v1 = allocator?.v1 || allocator;
        this.db = this.v1?.db || (allocator?.db ? allocator.db : null);
        
        if (Buffer.isBuffer(ptr) && ptr.length === 16) {
            this.ptr = SmartPointer.resolve(ptr, this.allocator);
        } else {
            this.ptr = ptr || null;
        }

        if (this.ptr) this.ptr.type = constants.VAL_TYPE.MAP;
        
        this.nodeIO = new MapNode(this.v1, this); 
        this.ops = new MapOps(this);
    }

    _log(msg) {
        if (this.db && this.db.debug) {
            try { fs.writeSync(2, `\x1b[34mB"H [MAP_ENGINE] ${msg}\x1b[0m\n`); } catch(e) {}
        }
    }

    create() {
        const node = { isLeaf: true, keys: [], values: [], children: [], totalCount: 0, totalBytes: 0 };
        const ptr = this.nodeIO.save(node);
        this.ptr = { ...ptr, type: constants.VAL_TYPE.MAP };
        this._log(`Manifested New Map Root at Block ${ptr.blockId}`);
        return SmartPointer.block(constants.VAL_TYPE.MAP, this.ptr.blockId, this.ptr.length, !!this.ptr.isChain, this.ptr.offset);
    }

    set(key, value, options = {}) {
        const valPtr = (options.isPtr) ? value : this.db.allocator.save(value);
        const keyBuf = Buffer.isBuffer(key) ? key : Buffer.from(String(key), 'utf8');

        let root = this.nodeIO.load(this.ptr);
        if (!root) { 
            this.create(); 
            root = this.nodeIO.load(this.ptr); 
        }
        
        const res = this.ops.insert(root, keyBuf, valPtr, options);
        
        if (res && res.split) {
            const split = res.split;
            const newRoot = {
                isLeaf: false, 
                keys: [split.key], 
                children: [
                    SmartPointer.toBuffer(split.nodePtr || this.ptr),
                    SmartPointer.toBuffer(split.ptr)
                ],
                values: [], totalCount: (root.totalCount || 0)
            };
            this.ptr = { ...this.nodeIO.save(newRoot), type: constants.VAL_TYPE.MAP };
        } else if (res && res.newPtr) {
            this.ptr = { ...res.newPtr, type: constants.VAL_TYPE.MAP };
        }
    }

    getPtr(key) {
        let currPtr = this.ptr;
        const keyBuf = Buffer.isBuffer(key) ? key : Buffer.from(String(key), 'utf8');
        
        while (currPtr && currPtr.blockId !== undefined) {
            const node = this.nodeIO.load(currPtr);
            if (!node) break;

            const { index, found } = this.ops._search(node, keyBuf);
            if (node.isLeaf) {
                return found ? node.values[index] : undefined;
            }
            
            let childIdx = found ? index + 1 : index;
            const childSeal = node.children[childIdx];
            currPtr = SmartPointer.resolve(childSeal, this.allocator);
        }
        return undefined;
    }

    get(key) {
        const ptr = this.getPtr(key);
        return ptr ? SmartPointer.resolve(ptr, this.allocator) : undefined;
    }

    /**
     * @description The Gate to Harvest — Yields the ordered keys and pointers.
     * B"H: This method is vital for ReaderIterator to function correctly.
     */
    * range() {
        this._log(`Starting Range Iterator from Root ${this.ptr?.blockId}`);
        yield* this.iterateRaw();
    }

    * iterateRaw() {
        if (!this.ptr || this.ptr.blockId === undefined) return;
        yield* this._iterateNodeRaw(this.ptr);
    }
    
    * _iterateNodeRaw(ptr) {
         const node = this.nodeIO.load(ptr);
         if (!node) return;
         if (node.isLeaf) {
             for (let i = 0; i < node.keys.length; i++) {
                 yield { key: node.keys[i], ptr: node.values[i] };
             }
         } else {
             for (let i = 0; i < node.children.length; i++) {
                 const childAddr = SmartPointer.resolve(node.children[i], this.allocator);
                 yield* this._iterateNodeRaw(childAddr);
             }
         }
    }

    [Symbol.iterator]() {
        const it = this.iterateRaw();
        return {
            next: () => {
                const n = it.next();
                if (n.done) return n;
                const { key, ptr } = n.value;
                return { 
                    value: { 
                        key: key.toString('utf8'), 
                        value: SmartPointer.resolve(ptr, this.allocator) 
                    }, 
                    done: false 
                };
            }
        };
    }
}
module.exports = MapEngine;