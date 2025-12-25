// B"H
const fs = require('fs');
const HandleRegistry = require('../../../core/handleRegistry.js');

class TensorSource {
    constructor() { this.type = 'base'; }
    async getTensorData(info) { throw new Error("Not implemented"); }
}

class FileSource extends TensorSource {
    constructor(filePath) {
        super();
        this.type = 'file';
        this.buffer = fs.readFileSync(filePath);
    }
    async init() { return this.buffer; }
    async getTensorData(info) { return null; }
}

class DbSource extends TensorSource {
    constructor(modelHandle) {
        super();
        this.type = 'db';
        this.handle = modelHandle;
        this.tensorsHandle = null;
        this.meta = null;
    }

    async init() {
        console.log(`\x1b[36mB"H [DbSource] Awakening Model from DB vessels...\x1b[0m`);
        const soul = HandleRegistry.getSoul(this.handle);
        if (!soul) throw new Error("B\"H Fatal: Invalid Model Handle.");
        
        await soul.ensureResolved();
        
        console.log(`\x1b[35m    Manifesting Metadata Architecture...\x1b[0m`);
        this.meta = await this.handle.info; 

        console.log(`\x1b[35m    Mapping Neural Cortex (Tensors)...\x1b[0m`);
        this.tensorsHandle = this.handle.tensors;
        await soul.db.ensureResolved(this.tensorsHandle);
    }
    
    async getTensorData(name) {
        const tensorHandle = this.tensorsHandle[name];
        const soul = HandleRegistry.getSoul(tensorHandle);
        await soul.ensureResolved();
        if (!soul.ptr) return null;
        return await tensorHandle; 
    }
}

module.exports = { FileSource, DbSource };
