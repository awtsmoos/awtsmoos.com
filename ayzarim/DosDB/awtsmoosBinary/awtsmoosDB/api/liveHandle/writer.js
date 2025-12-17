
// B"H
const constants = require('../../constants.js');
const StructBuilder = require('../../utils/structBuilder.js');
const WriterCommon = require('./writers/common.js');
const MapWriter = require('./writers/mapWriter.js');
const SequenceWriter = require('./writers/sequenceWriter.js');
const Sequence = require('../../structure/sequence/index.js'); // For concat
const SmartPointer = require('../../utils/smartPointer.js'); // For concat

class Writer {
    constructor(handle) {
        this.handle = handle;
        this.db = handle.db;
        this.builder = new StructBuilder(this.db.allocator);
        
        this.common = new WriterCommon(this);
        this.mapWriter = new MapWriter(this.common, this.builder);
        this.seqWriter = new SequenceWriter(this.common, this.builder);
    }

    async set(key, value, options = {}) {
        return this.db.execute(async () => {
            this.common.invalidateEngine(); 
            await this._setRaw(key, value, options);
        });
    }

    async _setRaw(key, value, options = {}) {
        // B"H: CRITICAL FIX - Force resolution to ensure we have the latest pointer
        // This is necessary because another concurrent write might have updated the parent's pointer for this handle.
        await this.handle.ensureResolved(true);
        
        if (!this.handle.ptr && this.handle !== this.db.root) {
             if(!this.handle.ptr) throw new Error(`Cannot set '${String(key)}' on undefined path.`);
        }

        // B"H: If type is unknown (null), we try to assume based on parent or context,
        // but often if it's null it means we need to resolve it first. 
        // ensureResolved above should have fixed it if it exists. 
        // If it still doesn't exist, we can't set on it directly without creating it.
        // But here we are setting a PROPERTY on the handle.
        
        if (this.handle.type === constants.TYPE_SEQUENCE) {
            await this.seqWriter.set(key, value, options);
        } else {
            // Default to Map/Dict writer for objects or unknowns (root)
            await this.mapWriter.set(key, value, options);
        }
    }

    async createMap(key) {
        return this.db.execute(async () => {
            this.common.invalidateEngine();
            await this.handle.ensureResolved(true);
            if (this.handle.type === constants.TYPE_SEQUENCE) {
                await this.seqWriter.createStructureInList(key, 'map');
            } else {
                await this.mapWriter.createStructure(key, 'map');
            }
        });
    }

    async createObject(key) {
        return this.db.execute(async () => {
            this.common.invalidateEngine();
            await this.handle.ensureResolved(true);
            if (this.handle.type === constants.TYPE_SEQUENCE) {
                await this.seqWriter.createStructureInList(key, 'object');
            } else {
                await this.mapWriter.createStructure(key, 'object');
            }
        });
    }

    async createList(key) {
        return this.set(key, []);
    }

    async delete(key) {
        return this.db.execute(async () => {
            this.common.invalidateEngine();
            await this.handle.ensureResolved(true);
            if (!this.handle.ptr) return false;
            
            if (this.handle.type === constants.TYPE_SEQUENCE) {
                return await this.seqWriter.delete(key);
            } else {
                return await this.mapWriter.delete(key);
            }
        });
    }

    async push(value, options = {}) {
        return this.db.execute(async () => {
            await this.handle.ensureResolved(true);
            if (this.handle.type !== constants.TYPE_SEQUENCE) throw new Error("Not a sequence");
            await this.seqWriter.push(value, options);
        });
    }

    async splice(start, deleteCount, ...args) {
        return this.db.execute(async () => {
            await this.handle.ensureResolved(true);
            if (this.handle.type !== constants.TYPE_SEQUENCE) throw new Error("Not a sequence");
            await this.seqWriter.splice(start, deleteCount, ...args);
        });
    }

    async compact() {
        return this.db.execute(async () => {
            await this.handle.ensureResolved(true);
            let structPtr = await this.common.resolveStructPtr();
            if (!structPtr) return false;

            if (this.handle.type === constants.TYPE_SEQUENCE) {
                const engine = await this.common.getEngine(structPtr, constants.TYPE_SEQUENCE);
                await engine.compact();
                if (engine.ptr.blockId !== structPtr.blockId) {
                    const newPtr = SmartPointer.block(this.handle.type, engine.ptr.blockId, engine.ptr.length, engine.ptr.isChain, engine.ptr.offset);
                    await this.handle._updatePointer(newPtr);
                    return true;
                }
            }
            return false;
        });
    }

    // Keep concat here as it's infrequent and touches two handles
    async concat(otherHandle) {
        return this.db.execute(async () => {
            this.common.invalidateEngine();
            await this.handle.ensureResolved(true);
            if (this.handle.type !== constants.TYPE_SEQUENCE) throw new Error("Not a sequence");
            if (otherHandle.ensureResolved) await otherHandle.ensureResolved();
            if (!otherHandle.ptr) return; 

            const structPtr = await this.common.resolveStructPtr();
            const seq = await this.common.getEngine(structPtr, constants.TYPE_SEQUENCE);
            
            let otherRes;
            if (otherHandle.ptr) otherRes = await SmartPointer.resolve(otherHandle.ptr, this.db.allocator);
            else return;

            const otherSeq = new Sequence(this.db.allocator, otherRes);
            await seq.concat(otherSeq);
            await this.common.checkAutoCompact(seq, constants.TYPE_SEQUENCE);
            
            const path = this.handle.getPath();
            if (await this.db.search.isIndexed(path)) {
                await this.db.search.reindex(path);
            }
        });
    }
}
module.exports = Writer;
