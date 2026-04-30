
// B"H
/**
 * @file type/allocator.js
 * @class AllocatorV2
 * @description
 *  =============================================================================
 *  CHAPTER 10: THE MASTER BUILDER OF REALITY
 *  =============================================================================
 */

const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer/index.js');
const PrimitiveSaver = require('./primitive/index.js');
const CustomInstanceSaver = require('./instance.js');
const StructBuilder = require('../../utils/builder/index.js');
const HeapManager = require('../heap.js');
const V1Allocator = require('../allocator/index.js');

class AllocatorV2 {
    constructor(pager, db) {
        this.pager = pager;
        this.db = db;
        this.v1 = new V1Allocator(pager, db);
        this.heap = new HeapManager(this.v1);
        this.builder = new StructBuilder(this);
        
        this.primitiveSaver = new PrimitiveSaver(this);
        this.customInstanceSaver = new CustomInstanceSaver(this);
    }

    init() { this.v1.init(); }

    readHeapBlock(blockId) {
        const fromMemory = this.heap.readBlock(blockId);
        if (fromMemory) return fromMemory;
        return this.v1.readBlockLocked(blockId, true);
    }

    save(val) {
        if (val === null || val === undefined) {
            return this.primitiveSaver.save(val);
        }

        if (typeof val === 'object' && val[constants.SYMBOLS.INTERNALS]) {
            const soul = val[constants.SYMBOLS.INTERNALS];
            soul.ensureResolved();
            return soul.ptr ? SmartPointer.toBuffer(soul.ptr) : this.primitiveSaver.save(null);
        }

        const isLeafObject = Buffer.isBuffer(val) || 
                             ArrayBuffer.isView(val) || 
                             val instanceof ArrayBuffer || 
                             val instanceof Date || 
                             val instanceof RegExp || 
                             val instanceof Error;

        if (typeof val !== 'object' || isLeafObject) {
            return this.primitiveSaver.save(val);
        }

        return this.builder.build(val);
    }

    _saveCustomInstance(obj, visited) { 
        return this.customInstanceSaver.save(obj, visited); 
    }

    flushHeap() { this.heap.flush(); }
}

module.exports = AllocatorV2;
