
// B"H
/**
 * @file source.js
 * @description 
 * Chapter 12: The Vessels of Memory
 * Constantly refreshed, these sources feed the AI, transforming dead bytes into living thought.
 */

const fs = require('fs');
const HandleRegistry = require('../../../../core/registry/handle.js');

class TensorSource {
    constructor() { this.type = 'base'; }
    getTensorData(info) { throw new Error("B\"H Not implemented"); }
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
        if (!soul) throw new Error("B\"H Fatal: Invalid Model Handle. The vessel lacks a soul.");
        soul.ensureResolved();

        this.meta = this.handle.info; 
        if (!this.meta) throw new Error("B\"H Model metadata missing in DB vessel.");

        this.tensorsHandle = this.handle.tensors;
        if (!this.tensorsHandle) throw new Error("B\"H Model tensors map missing.");
        
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
