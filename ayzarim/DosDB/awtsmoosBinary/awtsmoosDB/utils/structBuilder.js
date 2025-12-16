
// B"H
const constants = require('../constants.js');
const Dictionary = require('../structure/dictionary/index.js');
const Sequence = require('../structure/sequence/index.js');
const MapEngine = require('../structure/map/index.js');
const SmartPointer = require('./smartPointer.js');
const { readPointer48 } = require('./binaryHelpers.js');
const serializer = require('./serializer.js');
const keyEncoding = require('./keyEncoding.js');

class StructBuilder {
    constructor(allocator) {
        this.allocator = allocator;
    }

    async build(value, visited = new Map()) {
        if (value === null || value === undefined) {
            return this.allocator.save(value);
        }

        if (value.ptr && Buffer.isBuffer(value.ptr) && value.ptr.length === 16) {
            return value.ptr;
        }

        if (Buffer.isBuffer(value) || ArrayBuffer.isView(value) || value instanceof ArrayBuffer) {
            return this.allocator.save(value);
        }

        if (typeof value !== 'object') {
            return this.allocator.save(value);
        }
        
        if (value instanceof Date || value instanceof RegExp || value instanceof Error) {
            return this.allocator.save(value);
        }

        if (visited.has(value)) {
            return visited.get(value);
        }

        if (value instanceof Map) {
            const mapEngine = new MapEngine(this.allocator);
            await mapEngine.create(); 
            for (const [k, v] of value) {
                const key = keyEncoding.encode(k);
                const savedVal = await this.build(v, visited);
                await mapEngine.set(key, savedVal);
            }
            return SmartPointer.block(constants.TYPE_MAP, mapEngine.ptr.blockId, mapEngine.ptr.length, mapEngine.ptr.isChain, mapEngine.ptr.offset);
        }

        if (value instanceof Set) {
            const seq = new Sequence(this.allocator);
            await seq.create();
            for (const item of value) {
                const savedItem = await this.build(item, visited);
                await seq.push(savedItem);
            }
            return SmartPointer.block(constants.TYPE_SET, seq.ptr.blockId, seq.ptr.length, seq.ptr.isChain, seq.ptr.offset);
        }

        if (Array.isArray(value)) {
            const seq = new Sequence(this.allocator);
            await seq.create();
            
            // B"H: Parallelize Array Item Building
            // We build all items first, then push pointers. 
            // Sequence.push is sequential, but building items (allocating primitives/nested objs) can be parallel.
            const builtItems = await Promise.all(value.map(item => this.build(item, visited)));
            
            for (const ptr of builtItems) {
                await seq.push(ptr);
            }
            return SmartPointer.block(constants.TYPE_SEQUENCE, seq.ptr.blockId, seq.ptr.length, seq.ptr.isChain, seq.ptr.offset);
        } 
        
        // Custom Classes
        if (value.constructor && value.constructor.name !== 'Object') {
            const className = value.constructor.name || "Anonymous";
            let source = value.constructor.toString();
            
            if (!source.includes('[native code]')) {
                const dict = new Dictionary(this.allocator);
                const dictPtr = await dict.create();
                
                const nameBuf = serializer.writeString(className);
                const sourceBuf = serializer.writeString(source);
                const metaBlock = Buffer.concat([nameBuf, sourceBuf, dictPtr]);
                
                const metaPtr = await this.allocator.v1.allocate(metaBlock.length);
                await this.allocator.v1.db._writeChainSafe(metaPtr, metaBlock);
                
                const instancePtr = SmartPointer.block(
                    constants.TYPE_CUSTOM_INSTANCE, 
                    metaPtr.blockId, 
                    metaBlock.length, 
                    metaPtr.isChain,
                    metaPtr.offset
                );
                
                visited.set(value, instancePtr);

                const keys = Reflect.ownKeys(value);
                const buildPromises = [];
                
                for (const k of keys) {
                    const desc = Object.getOwnPropertyDescriptor(value, k);
                    if (desc && (desc.enumerable || typeof k === 'symbol')) {
                        buildPromises.push(async () => {
                            const savedVal = await this.build(value[k], visited);
                            const storageKey = keyEncoding.encode(k);
                            return { key: storageKey, val: savedVal };
                        });
                    }
                }
                
                const results = await Promise.all(buildPromises.map(fn => fn()));
                for(const res of results) {
                    await dict.set(res.key, res.val);
                }
                
                return instancePtr;
            }
        }

        // Standard Dictionary for Objects
        const dict = new Dictionary(this.allocator);
        const dictPtr = await dict.create();
        visited.set(value, dictPtr);
        
        const keys = Reflect.ownKeys(value);
        const buildPromises = [];

        for (const k of keys) {
            const desc = Object.getOwnPropertyDescriptor(value, k);
            if (desc && (desc.enumerable || typeof k === 'symbol')) {
                buildPromises.push(async () => {
                    const savedVal = await this.build(value[k], visited);
                    const storageKey = keyEncoding.encode(k);
                    return { key: storageKey, val: savedVal };
                });
            }
        }

        // Execute value building in parallel
        const results = await Promise.all(buildPromises.map(fn => fn()));
        
        // Dictionary Set must be sequential to avoid lock contention on the same structure
        for (const res of results) {
            await dict.set(res.key, res.val);
        }

        return dictPtr;
    }
}

module.exports = StructBuilder;
