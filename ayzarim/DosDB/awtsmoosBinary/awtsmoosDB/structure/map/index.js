
// B"H
/**
 * @file map/index.js
 * @chapter The Mountain of Sorted Truth (Map)
 * @description
 * High-performance B-Tree implementation. Everything is orchestrated 
 * from the specialized angelic sub-modules.
 */

const MapNode = require('./node.js');
const Insertion = require('./ops/insertion.js');
const Deletion = require('./ops/deletion.js');
const SmartPointer = require('../../utils/smartPointer/index.js');
const constants = require('../../constants.js');

class MapEngine {
    constructor(allocator, ptr = null) {
        this.allocator = allocator;
        this.db = allocator.db;
        this.ptr = Buffer.isBuffer(ptr) ? SmartPointer.decode(ptr) : ptr;
        this.nodeIO = new MapNode(this.allocator);
        
        this.insertOps = new Insertion(this.nodeIO);
        this.deleteOps = new Deletion(this.nodeIO);
    }

    create() {
        const root = { isLeaf: true, keys: [], values: [] };
        const pSeal = this.nodeIO.save(root);
        this.ptr = SmartPointer.decode(pSeal);
        return pSeal;
    }

    getPtr(key) {
        if (!this.ptr) return null;
        const MapSeeker = require('./seeker.js');
        return MapSeeker.get(this.db, this.ptr, key);
    }

    set(key, valPtr) {
        if (!this.ptr) this.create();
        const root = this.nodeIO.load(this.ptr);
        const keyBuf = Buffer.isBuffer(key) ? key : Buffer.from(String(key), 'utf8');
        
        const res = this.insertOps.perform(root, keyBuf, valPtr);
        this.ptr = SmartPointer.decode(res.newSeal);
        return res.newSeal;
    }

    delete(key) {
        if (!this.ptr) return false;
        const root = this.nodeIO.load(this.ptr);
        const keyBuf = Buffer.from(String(key), 'utf8');
        
        const res = this.deleteOps.perform(root, keyBuf);
        if (res.success) {
            this.ptr = SmartPointer.decode(res.newSeal);
            return true;
        }
        return false;
    }

    *range(start, end) {
        if (!this.ptr) return;
        yield* this._walk(this.nodeIO.load(this.ptr), start, end);
    }

    *_walk(node, start, end) {
        if (!node) return;
        const s = start ? Buffer.from(String(start), 'utf8') : null;
        const e = end ? Buffer.from(String(end), 'utf8') : null;
        
        if (node.isLeaf) {
            for (let i = 0; i < node.keys.length; i++) {
                if (s && node.keys[i].compare(s) < 0) continue;
                if (e && node.keys[i].compare(e) > 0) break;
                yield { key: node.keys[i], ptr: node.values[i] };
            }
        } else {
            for (const cp of node.children) {
                yield* this._walk(this.nodeIO.load(SmartPointer.decode(cp)), start, end);
            }
        }
    }
}

module.exports = MapEngine;
