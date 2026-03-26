
// B"H
/**
 * @file type/allocator.js
 * @class AllocatorV2
 * @description
 *  =============================================================================
 *  CHAPTER 1: THE MASTER BUILDER OF REALITY
 *  =============================================================================
 *  "With wisdom the house is built, and with understanding it is established." 
 *  (Proverbs 24:3)
 * 
 *  The Allocator is the Sefirah of Chesed—the boundless flow of existence that 
 *  seeks to give every spark of data a physical home on the disk. 
 *  
 *  THE TIKKUN OF RECURSION:
 *  A great error occurred where the Builder and Allocator each pointed to 
 *  the other in an endless dance of nothingness, leading to a `RangeError`. 
 *  We now implement the Law of Separation. Objects that are "Leafs" (the final 
 *  manifestations of binary light, such as Buffers and ArrayBuffers) are 
 *  immediately sealed by the `PrimitiveSaver`, while only complex, composite 
 *  structures are permitted to enter the `Builder`.
 */

const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');
const PrimitiveSaver = require('./primitive.js');
const CustomInstanceSaver = require('./instance.js');
const StructBuilder = require('../../utils/structBuilder.js');
const HeapManager = require('../heap.js');
const V1Allocator = require('../allocator/index.js');

class AllocatorV2 {
    /**
     * @constructor
     * @param {Object} pager - The physical foundation (Yesod).
     * @param {Object} db - The Awtsmoos database context.
     */
    constructor(pager, db) {
        this.pager = pager;
        this.db = db;
        this.v1 = new V1Allocator(pager, db);
        this.heap = new HeapManager(this.v1);
        this.builder = new StructBuilder(this);
        
        this.primitiveSaver = new PrimitiveSaver(this);
        this.customInstanceSaver = new CustomInstanceSaver(this);
    }

    /**
     * @method init
     * @description Awakens the physical kernel.
     */
    init() { this.v1.init(); }

    /**
     * @method readHeapBlock
     * @description Fetches a block of memory from the ethereal heap.
     */
    readHeapBlock(blockId) {
        const fromMemory = this.heap.readBlock(blockId);
        if (fromMemory) return fromMemory;
        return this.v1.readBlockLocked(blockId, true);
    }

    /**
     * @method save
     * @description 
     *  The entry point of Manifestation. Discerns whether a value is an 
     *  atomic spark (Primitive) or a complex constellation (Structure).
     */
    save(val) {
        // 1. Handling the Void
        if (val === null || val === undefined) {
            return this.primitiveSaver.save(val);
        }

        // 2. Handling Existing Souls (LiveHandles)
        if (typeof val === 'object' && val[constants.SYMBOLS.INTERNALS]) {
            const soul = val[constants.SYMBOLS.INTERNALS];
            soul.ensureResolved();
            return soul.ptr || SmartPointer.encode(constants.VAL_TYPE.NULL, constants.MODE_INLINE, Buffer.alloc(15));
        }

        // 3. THE TIKKUN: Identification of Leaf Objects
        // If it is a string, number, or boolean -> PrimitiveSaver
        // If it is an Object that is a "Binary Leaf" (Buffer, View, ArrayBuffer) -> PrimitiveSaver
        const isLeafObject = Buffer.isBuffer(val) || 
                             ArrayBuffer.isView(val) || 
                             val instanceof ArrayBuffer || 
                             val instanceof Date || 
                             val instanceof RegExp;

        if (typeof val !== 'object' || isLeafObject) {
            return this.primitiveSaver.save(val);
        }

        // 4. Complex Structures (Objects, Arrays, Maps, Sets) -> StructBuilder
        return this.builder.build(val);
    }

    /**
     * @method _saveCustomInstance
     * @description Special rite for preserving the source and state of custom classes.
     */
    _saveCustomInstance(obj, visited) { 
        return this.customInstanceSaver.save(obj, visited); 
    }

    /**
     * @method flushHeap
     * @description Commits the ethereal memory to the physical stone.
     */
    flushHeap() { this.heap.flush(); }
}

module.exports = AllocatorV2;
