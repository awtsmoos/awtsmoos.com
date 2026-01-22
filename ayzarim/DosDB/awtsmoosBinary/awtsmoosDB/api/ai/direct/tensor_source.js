// B"H
/**
 * @file tensor_source.js
 * @description Synchronous abstraction for fetching raw tensor bytes.
 * REMOVED ASYNC/AWAIT.
 */
const fs = require('fs');
const HandleRegistry = require('../../../core/handleRegistry.js');

class TensorSource {
    constructor() { this.type = 'base'; }
    getTensorData(info) { throw new Error("Not implemented"); }
}

class FileSource extends TensorSource {
    constructor(filePath) {
        super();
        this.type = 'file';
        this.filePath = filePath;
        this.buffer = null;
    }
    
    init() {
        if (!this.buffer) {
            this.buffer = fs.readFileSync(this.filePath);
        }
    }
}

class DbSource extends TensorSource {
    constructor(modelHandle) {
        super();
        this.type = 'db';
        this.handle = modelHandle;
        this.meta = null;
        this.tensorsHandle = null;
    }

    init() {
        const soul = HandleRegistry.getSoul(this.handle);
        if (!soul) throw new Error("B\"H Fatal: Invalid Model Handle.");
        soul.ensureResolved();

        this.meta = this.handle.info; 
        if (!this.meta) throw new Error("Model metadata missing in DB vessel.");

        this.tensorsHandle = this.handle.tensors;
        if (!this.tensorsHandle) throw new Error("Model tensors map missing.");
        
        const tSoul = HandleRegistry.getSoul(this.tensorsHandle);
        tSoul.ensureResolved();
    }
    
    getTensorData(name) {
        const val = this.tensorsHandle[name];
        if (Buffer.isBuffer(val)) return val;
        return null;
    }
}

module.exports = { FileSource, DbSource };