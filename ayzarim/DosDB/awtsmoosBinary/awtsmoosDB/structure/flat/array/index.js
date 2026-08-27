
// B"H
/**
 * @file index.js
 * @class FlatArray
 * @description
 *  =============================================================================
 *  CHAPTER 1: THE TIGHT SEQUENCE (FLAT ARRAY ENTRY)
 *  =============================================================================
 *  Just as the Earth was formed from nothingness and divided by precise borders,
 *  the Flat Array packs pointers tightly side-by-side with no overhead metadata 
 *  other than the absolute count. This achieves maximum density before requiring 
 *  the elevation to a B-Tree Sequence.
 */

const SmartPointer = require('../../../utils/smartPointer.js');
const constants = require('../../../constants.js');
const IoVessel = require('./io_vessel.js');
const Mutator = require('./mutator.js');
const Seeker = require('./seeker.js');
const Shatterer = require('./shatter.js');

class FlatArray {
    constructor(allocator, ptr = null) {
        this.allocator = allocator;
        this.v1 = allocator?.v1 || allocator;
        
        if (Buffer.isBuffer(ptr)) {
            const dec = SmartPointer.decode(ptr);
            if (dec) {
                this.ptr = { isStructure: true, type: dec.type, offset: dec.offset, length: dec.length, ptr };
            } else {
                this.ptr = ptr;
            }
        } else {
            this.ptr = ptr;
        }
        
        this.isShattered = false;
        this.engine = null; 
        
        this.io = new IoVessel(this);
        this.mutator = new Mutator(this);
        this.seeker = new Seeker(this);
        this.shatterer = new Shatterer(this);
    }

    create() {
        return this.io.create();
    }

    length() {
        return this.seeker.length();
    }

    get(index) {
        return this.seeker.get(index);
    }

    push(itemPtr) {
        return this.mutator.push(itemPtr);
    }

    splice(start, delCount, itemPtrs) {
        return this.mutator.splice(start, delCount, itemPtrs);
    }

    shatter() {
        this.shatterer.shatter();
    }
}

module.exports = FlatArray;
