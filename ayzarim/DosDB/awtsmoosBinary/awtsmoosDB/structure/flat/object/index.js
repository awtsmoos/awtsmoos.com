
// B"H
const SmartPointer = require('../../../utils/smartPointer.js');
const constants = require('../../../constants.js');
const ObjectReader = require('./io/reader.js');
const ObjectWriter = require('./io/writer.js');
const ObjectSetter = require('./mutation/setter.js');
const ObjectDeleter = require('./mutation/deleter.js');
const ObjectSeeker = require('./query/seeker.js');
const ObjectIterator = require('./query/iterator.js');
const ObjectShatterer = require('./elevation/shatterer.js');

class FlatObject {
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
        
        this.reader = new ObjectReader(this);
        this.writer = new ObjectWriter(this);
        this.setter = new ObjectSetter(this);
        this.deleter = new ObjectDeleter(this);
        this.seeker = new ObjectSeeker(this);
        this.iterator = new ObjectIterator(this);
        this.shatterer = new ObjectShatterer(this);
    }

    create() {
        const Healer = require('./io/healer.js');
        Healer.createRoot(this);
        return SmartPointer.toBuffer(this.ptr);
    }

    length() { return this.seeker.length(); }
    get(key) { return this.seeker.get(key); }
    set(key, itemPtr) { return this.setter.set(key, itemPtr); }
    delete(key) { return this.deleter.delete(key); }
    *keys() { yield* this.iterator.keys(); }
    *entries(ctx) { yield* this.iterator.entries(ctx); }
}

module.exports = FlatObject;
