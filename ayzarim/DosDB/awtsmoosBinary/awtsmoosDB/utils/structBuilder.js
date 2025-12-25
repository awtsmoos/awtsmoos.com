// B"H
const constants = require('../constants.js');
const Dictionary = require('../structure/dictionary/index.js');
const Sequence = require('../structure/sequence/index.js');
const MapEngine = require('../structure/map/index.js');
const SmartPointer = require('./smartPointer.js');
const { readPointer48 } = require('./binaryHelpers.js');
const serializer = require('./serializer.js');
const keyEncoding = require('./keyEncoding.js');
const SmartBinary = require('./smartBinary.js');

class StructBuilder {
    constructor(allocator) {
        this.allocator = allocator;
        // B"H: Threshold for Inline Promotion
        // If an object serialized is smaller than this, it stays inline.
        // 2048 bytes (half a block) is a good balance.
        this.INLINE_THRESHOLD = 2048;
    }

    async build(value, visited = new Map(), stack = new Set()) {
        if (value === null || value === undefined) return this.allocator.save(value);
        if (value.ptr && Buffer.isBuffer(value.ptr) && value.ptr.length === 16) return value.ptr;
        if (Buffer.isBuffer(value) || ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return this.allocator.save(value);
        if (typeof value !== 'object') return this.allocator.save(value);
        if (value instanceof Date || value instanceof RegExp || value instanceof Error) return this.allocator.save(value);

        if (visited.has(value)) return visited.get(value);

        // B"H: Cycle Detection for Inline Phase
        // If we are already building this object up the stack, we cannot inline it 
        // because inline requires value-based recursion (infinite).
        // We skip to Phase 2 (Block) which handles cycles via pointers.
        const isCycle = stack.has(value);
        
        // --- PHASE 1: Attempt Inline Serialization ---
        // We try to serialize it as a SmartObject/SmartArray in memory.
        // If it fits, we return an Inline Pointer.
        // If not, we fall back to the Heavy Block structures.
        
        let inlineAttempt = null;
        if (!isCycle) {
            stack.add(value);
            try {
                if (Array.isArray(value)) {
                    // Optimization: If array is huge, don't even try inline
                    if (value.length < 100) {
                        const preparedChildren = [];
                        let fits = true;
                        for(const item of value) {
                            const childPtr = await this.build(item, visited, stack);
                            preparedChildren.push(childPtr);
                            // Heuristic check
                            if (childPtr.length > this.INLINE_THRESHOLD) { fits = false; break; }
                        }
                        
                        if (fits) {
                            const bin = SmartBinary.serializeArray(preparedChildren);
                            if (bin.length <= this.INLINE_THRESHOLD) {
                                inlineAttempt = SmartPointer.inline(constants.TYPE_SMART_ARRAY, bin);
                            }
                        }
                    }
                } else if (value.constructor === Object) { // Plain Object
                    const keys = Object.keys(value);
                    if (keys.length < 50) {
                        const preparedObj = {};
                        let fits = true;
                        for(const k of keys) {
                            const childPtr = await this.build(value[k], visited, stack);
                            preparedObj[k] = { ptr: childPtr }; // Wrapper for SmartBinary serializer
                            if (childPtr.length > this.INLINE_THRESHOLD) { fits = false; break; }
                        }
                        
                        if (fits) {
                            const bin = SmartBinary.serializeObject(preparedObj);
                            if (bin.length <= this.INLINE_THRESHOLD) {
                                inlineAttempt = SmartPointer.inline(constants.TYPE_SMART_OBJECT, bin);
                            }
                        }
                    }
                }
            } catch(e) {
                // Ignore inline errors, fall back to block
                // console.warn("Inline attempt failed", e);
            } finally {
                stack.delete(value);
            }
        }

        // B"H: IDENTITY CHECK
        // If recursive calls inside Phase 1 triggered Phase 2 for *this* object (due to cycles),
        // then `visited` will now contain the Block Pointer for this object.
        // We MUST use that Block Pointer instead of the Inline result to maintain object identity.
        if (visited.has(value)) return visited.get(value);

        if (inlineAttempt) return inlineAttempt;


        // --- PHASE 2: Heavy Block Structures ---
        // Cycles handled here because we allocate pointer and add to visited BEFORE recursion.
        // B"H: FIX - Must update visited with the FINAL pointer if it moves during population.
        
        if (value instanceof Map) {
            let mapEngine;
            await this.allocator.v1.db.batch(async () => {
                mapEngine = new MapEngine(this.allocator);
                await mapEngine.create(); 
                // Set initial to support recursion (though it might become stale if moved)
                visited.set(value, SmartPointer.block(constants.TYPE_MAP, mapEngine.ptr.blockId, mapEngine.ptr.length, mapEngine.ptr.isChain, mapEngine.ptr.offset));

                for (const [k, v] of value) {
                    const key = keyEncoding.encode(k);
                    const savedVal = await this.build(v, visited, stack);
                    // B"H: Fix - Pass isPtr: true
                    await mapEngine.set(key, savedVal, { isPtr: true });
                }
            });
            // Update to final pointer
            const finalPtr = SmartPointer.block(constants.TYPE_MAP, mapEngine.ptr.blockId, mapEngine.ptr.length, mapEngine.ptr.isChain, mapEngine.ptr.offset);
            visited.set(value, finalPtr);
            return finalPtr;
        }

        if (value instanceof Set) {
            let seq;
            await this.allocator.v1.db.batch(async () => {
                seq = new Sequence(this.allocator);
                await seq.create();
                visited.set(value, SmartPointer.block(constants.TYPE_SET, seq.ptr.blockId, seq.ptr.length, seq.ptr.isChain, seq.ptr.offset));
                
                for (const item of value) {
                    const ptr = await this.build(item, visited, stack);
                    await seq.push(ptr);
                }
            });
            const finalPtr = SmartPointer.block(constants.TYPE_SET, seq.ptr.blockId, seq.ptr.length, seq.ptr.isChain, seq.ptr.offset);
            visited.set(value, finalPtr);
            return finalPtr;
        }

        if (Array.isArray(value)) {
            let seq;
            await this.allocator.v1.db.batch(async () => {
                seq = new Sequence(this.allocator);
                await seq.create();
                visited.set(value, SmartPointer.block(constants.TYPE_SEQUENCE, seq.ptr.blockId, seq.ptr.length, seq.ptr.isChain, seq.ptr.offset));
                
                for (const item of value) {
                    const ptr = await this.build(item, visited, stack);
                    await seq.push(ptr);
                }
            });
            const finalPtr = SmartPointer.block(constants.TYPE_SEQUENCE, seq.ptr.blockId, seq.ptr.length, seq.ptr.isChain, seq.ptr.offset);
            visited.set(value, finalPtr);
            return finalPtr;
        } 
        
        // Custom Classes
        if (value.constructor && value.constructor.name !== 'Object') {
            const className = value.constructor.name || "Anonymous";
            let source = value.constructor.toString();
            
            if (!source.includes('[native code]')) {
                let dict;
                let instancePtr;
                
                await this.allocator.v1.db.batch(async () => {
                    dict = new Dictionary(this.allocator);
                    const dictPtr = await dict.create();
                    
                    const nameBuf = serializer.writeString(className);
                    const sourceBuf = serializer.writeString(source);
                    
                    const metaBlock = Buffer.concat([nameBuf, sourceBuf, dictPtr]);
                    
                    const metaPtr = await this.allocator.v1.allocate(metaBlock.length);
                    await this.allocator.v1.db._writeChainSafe(metaPtr, metaBlock);
                    
                    instancePtr = SmartPointer.block(
                        constants.TYPE_CUSTOM_INSTANCE, 
                        metaPtr.blockId, 
                        metaBlock.length, 
                        metaPtr.isChain, 
                        metaPtr.offset
                    );
                    
                    visited.set(value, instancePtr);

                    const keys = Reflect.ownKeys(value);
                    for (const k of keys) {
                        const desc = Object.getOwnPropertyDescriptor(value, k);
                        if (desc && (desc.enumerable || typeof k === 'symbol')) {
                            const savedVal = await this.build(value[k], visited, stack);
                            const storageKey = keyEncoding.encode(k);
                            // B"H: FIX - Explicitly mark as pointer
                            await dict.set(storageKey, savedVal, { isPtr: true });
                        }
                    }
                });
                return instancePtr;
            }
        }

        // Standard Dictionary for Large Objects
        let dict;
        
        await this.allocator.v1.db.batch(async () => {
            dict = new Dictionary(this.allocator);
            const dictPtr = await dict.create();
            visited.set(value, dictPtr);
            
            const keys = Reflect.ownKeys(value);
            for (const k of keys) {
                const desc = Object.getOwnPropertyDescriptor(value, k);
                if (desc && (desc.enumerable || typeof k === 'symbol')) {
                    const savedVal = await this.build(value[k], visited, stack);
                    const storageKey = keyEncoding.encode(k);
                    // B"H: FIX - Explicitly mark as pointer
                    await dict.set(storageKey, savedVal, { isPtr: true });
                }
            }
        });
        
        // Return potentially updated pointer
        const finalPtr = SmartPointer.block(constants.TYPE_DICTIONARY, dict.ptr.blockId, dict.ptr.length, dict.ptr.isChain, dict.ptr.offset);
        visited.set(value, finalPtr);
        return finalPtr;
    }
}

module.exports = StructBuilder;