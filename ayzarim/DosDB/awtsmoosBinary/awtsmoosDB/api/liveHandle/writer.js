// B"H
// File: /BH/awtsmoos.com/ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/api/liveHandle/writer.js

const constants = require('../../constants.js');
const Sequence = require('../../structure/sequence/index.js'); 
const Dictionary = require('../../structure/dictionary/index.js');
const MapEngine = require('../../structure/map/index.js');
const keyEncoding = require('../../utils/keyEncoding.js');
const SmartPointer = require('../../utils/smartPointer.js');
const { readPointer48 } = require('../../utils/binaryHelpers.js');

class Writer {
    constructor(handle) {
        this.handle = handle;
        this.db = handle.db;
        this.common = new (require('./writers/common.js'))(this);
        
        // Modules specific logic separation
        this.seqWriter = new (require('./writers/sequenceWriter.js'))(this.common, this.db.allocator.builder);
        this.mapWriter = new (require('./writers/mapWriter.js'))(this.common, this.db.allocator.builder);
    }

    _normalize(ptr) {
        if (!ptr) return null;
        if (Buffer.isBuffer(ptr) && ptr.length === 16) {
            const decoded = SmartPointer.decode(ptr);
            if (!decoded) return null;
            if (decoded.mode === constants.MODE_BLOCK) {
                return {
                    blockId: readPointer48(decoded.payload, 0),
                    length: decoded.payload.readUInt32BE(6),
                    offset: decoded.payload.readUInt32BE(10),
                    isChain: decoded.payload.readUInt8(14) === 1
                };
            }
            if (decoded.mode === constants.MODE_HEAP) {
                return {
                    blockId: readPointer48(decoded.payload, 0),
                    offset: decoded.payload.readUInt32BE(6),
                    length: decoded.payload.readUInt32BE(10),
                    isHeap: true
                };
            }
        }
        return typeof ptr === 'object' ? ptr : SmartPointer.resolve(ptr, this.db.allocator);
    }

    set(key, value, options = {}) {
        if (this.handle.type === constants.VAL_TYPE.SEQUENCE) {
             return this.seqWriter.set(key, value, options);
        } else {
             return this.mapWriter.set(key, value, options);
        }
    }

    push(value) {
        if (this.handle.type !== constants.VAL_TYPE.SEQUENCE) throw new Error("B\"H: push only allowed on Sequence");
        return this.seqWriter.push(value);
    }

    splice(...args) {
        if (this.handle.type !== constants.VAL_TYPE.SEQUENCE) throw new Error("B\"H: splice only allowed on Sequence");
        return this.seqWriter.splice(...args);
    }

    delete(key) {
        if (this.handle.type === constants.VAL_TYPE.SEQUENCE) return this.seqWriter.delete(key);
        return this.mapWriter.delete(key);
    }
    
    compact() {
        if (this.common._cachedEngine) this.common.checkAutoCompact(this.common._cachedEngine, this.handle.type);
    }
}
module.exports = Writer;