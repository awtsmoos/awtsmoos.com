
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

    /**
     * @method bulkLoadSorted
     * @description
     * Builds a B-tree from sorted unique entries in one bottom-up pass. This is
     * for fresh/import workloads and is bounded by the caller's current entry
     * group, not the whole database.
     *
     * @param {Array<{key:Buffer|string,value:Buffer}>} entries - Sorted entries.
     * @param {object} [options] - Builder options.
     * @returns {Buffer} Root map seal.
     */
    bulkLoadSorted(entries, options = {}) {
        const maxKeys = Math.max(8, Number(options.maxKeys || 200));
        const prepared = Array.from(entries || []).map(entry => ({
            key: Buffer.isBuffer(entry.key) ? entry.key : Buffer.from(String(entry.key), 'utf8'),
            value: SmartPointer.toBuffer(entry.value)
        }));

        if (prepared.length === 0) return this.create();

        const leaves = [];
        for (let i = 0; i < prepared.length; i += maxKeys) {
            const group = prepared.slice(i, i + maxKeys);
            const node = {
                isLeaf: true,
                keys: group.map(entry => entry.key),
                values: group.map(entry => entry.value)
            };
            leaves.push({ firstKey: group[0].key, seal: this.nodeIO.save(node) });
        }

        let level = leaves;
        while (level.length > 1) {
            const next = [];
            const maxChildren = maxKeys + 1;
            for (let i = 0; i < level.length; i += maxChildren) {
                const children = level.slice(i, i + maxChildren);
                const node = {
                    isLeaf: false,
                    keys: children.slice(1).map(child => child.firstKey),
                    children: children.map(child => child.seal)
                };
                next.push({ firstKey: children[0].firstKey, seal: this.nodeIO.save(node) });
            }
            level = next;
        }

        this.ptr = SmartPointer.decode(level[0].seal);
        return level[0].seal;
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
