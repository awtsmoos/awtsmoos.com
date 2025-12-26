// B"H
/**
 * @file structBuilder.js
 * @description
 *  The Architect of Manifestation. 
 *  Translates living JS objects into physical database vessels synchronously.
 */

const constants = require('../constants.js');
const Dictionary = require('../structure/dictionary/index.js');
const Sequence = require('../structure/sequence/index.js');
const MapEngine = require('../structure/map/index.js');
const SmartPointer = require('./smartPointer.js');
const keyEncoding = require('./keyEncoding.js');
const SmartBinary = require('./smartBinary.js');

class StructBuilder {
    constructor(allocator) {
        this.allocator = allocator;
        this.INLINE_THRESHOLD = 2048;
    }

    /**
     * @description Synchronously manifests a JS value into a persistent pointer.
     */
    build(value, visited = new Map(), stack = new Set()) {
        const T = constants.VAL_TYPE;
        const HandleRegistry = require('../core/handleRegistry.js');

        // Check if value is already a handle
        const soul = HandleRegistry.getSoul(value);
        if (soul && soul.ptr) return soul.ptr;

        if (value === null || value === undefined) return this.allocator.save(value);
        if (Buffer.isBuffer(value) && value.length === 16) return value;
        if (Buffer.isBuffer(value) || ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return this.allocator.save(value);
        if (typeof value !== 'object') return this.allocator.save(value);
        if (value instanceof Date || value instanceof RegExp || value instanceof Error) return this.allocator.save(value);

        if (visited.has(value)) return visited.get(value);

        const isCycle = stack.has(value);
        const db = this.allocator.v1.db;
        
        const isMarker = (db.Map && value instanceof db.Map) || 
                         (db.List && value instanceof db.List) || 
                         (db.Set && value instanceof db.Set) ||
                         (db.Object && value instanceof db.Object);
        
        let inlineAttempt = null;
        if (!isCycle && !isMarker) {
            stack.add(value);
            try {
                if (Array.isArray(value)) {
                    if (value.length < 100) {
                        const preparedChildren = [];
                        let fits = true;
                        for(const item of value) {
                            const childPtr = this.build(item, visited, stack);
                            preparedChildren.push(childPtr);
                            if (childPtr.length > this.INLINE_THRESHOLD) { fits = false; break; }
                        }
                        if (fits) {
                            const bin = SmartBinary.serializeArray(preparedChildren);
                            if (bin.length <= this.INLINE_THRESHOLD) inlineAttempt = SmartPointer.encode(T.SMART_ARRAY, constants.MODE_INLINE, bin);
                        }
                    }
                } else if (value.constructor === Object) {
                    const keys = Object.keys(value);
                    if (keys.length < 50) {
                        const preparedObj = {};
                        let fits = true;
                        for(const k of keys) {
                            const childPtr = this.build(value[k], visited, stack);
                            preparedObj[k] = { ptr: childPtr };
                            if (childPtr.length > this.INLINE_THRESHOLD) { fits = false; break; }
                        }
                        if (fits) {
                            const bin = SmartBinary.serializeObject(preparedObj);
                            if (bin.length <= this.INLINE_THRESHOLD) inlineAttempt = SmartPointer.encode(T.SMART_OBJECT, constants.MODE_INLINE, bin);
                        }
                    }
                }
            } catch(e) { } finally { stack.delete(value); }
        }

        if (visited.has(value)) return visited.get(value);
        if (inlineAttempt) return inlineAttempt;

        // Block Structure Manifestation
        if (value instanceof Map) {
            const mapEngine = new MapEngine(this.allocator);
            mapEngine.create();
            const finalPtr = SmartPointer.block(T.MAP, mapEngine.ptr.blockId, mapEngine.ptr.length, mapEngine.ptr.isChain, mapEngine.ptr.offset);
            visited.set(value, finalPtr);
            for (const [k, v] of value) {
                mapEngine.set(keyEncoding.encode(k), this.build(v, visited, stack), { isPtr: true });
            }
            return finalPtr;
        }

        if (value instanceof Set || Array.isArray(value)) {
            const finalT = (value instanceof Set) ? T.SET : T.SEQUENCE;
            const seq = new Sequence(this.allocator);
            seq.create();
            const finalPtr = SmartPointer.block(finalT, seq.ptr.blockId, seq.ptr.length, seq.ptr.isChain, seq.ptr.offset);
            visited.set(value, finalPtr);
            const items = (value instanceof Set) ? Array.from(value) : value;
            for (const item of items) {
                seq.push(this.build(item, visited, stack));
            }
            return finalPtr;
        }

        const dict = new Dictionary(this.allocator);
        const dictPtr = dict.create();
        visited.set(value, dictPtr);
        for (const k of Reflect.ownKeys(value)) {
            const desc = Object.getOwnPropertyDescriptor(value, k);
            if (desc && (desc.enumerable || typeof k === 'symbol')) {
                dict.set(keyEncoding.encode(k), this.build(value[k], visited, stack), { isPtr: true });
            }
        }
        return dictPtr;
    }
}
module.exports = StructBuilder;
