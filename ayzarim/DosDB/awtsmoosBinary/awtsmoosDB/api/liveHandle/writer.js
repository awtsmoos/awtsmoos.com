
// B"H
const constants = require('../../constants.js');
const StructBuilder = require('../../utils/structBuilder.js');
const WriterCommon = require('./writers/common.js');
const MapWriter = require('./writers/mapWriter.js');
const SequenceWriter = require('./writers/sequenceWriter.js');
const Dictionary = require('../../structure/dictionary/index.js');
const keyEncoding = require('../../utils/keyEncoding.js');
const HandleRegistry = require('../../core/handleRegistry.js');

class Writer {
    constructor(handle) {
        this.handle = handle; // state (soul)
        this.db = handle.db;
        this.builder = new StructBuilder(this.db.allocator);
        
        this.common = new WriterCommon(this);
        this.mapWriter = new MapWriter(this.common, this.builder);
        this.seqWriter = new SequenceWriter(this.common, this.builder);
    }

    log(msg) {
        if (this.db.debug) {
            console.log(`\x1b[33m[Writer:${this.handle.getPath()}]\x1b[0m ${msg}`);
        }
    }

    /**
     * @description Sets a value, wrapping the entire operation in a write lock.
     */
    async set(key, value, options = {}) {
        return this.db.execute(async () => {
            this.log(`START SET [key:${key}]`);
            await this._setRaw(key, value, options);
            this.db.mutationCount++;
            this.log(`END SET [key:${key}] - Global Mutation: ${this.db.mutationCount}`);
        });
    }

    /**
     * @description Internal set logic without locking, handles promotion and pointer bubbling.
     */
    async _setRaw(key, value, options = {}) {
        const isBubbling = !!options.isPtr;
        
        this.log(`_setRaw [key:${key}] (Bubbling: ${isBubbling})`);

        // B"H: CRITICAL - When bubbling, we MUST ensure the current handle's pointer 
        // is valid relative to its parent, even if the mutation count hasn't changed yet.
        await this.handle.ensureResolved(isBubbling);
        
        // Invalidate cache BEFORE the write to ensure engine reads freshest bits
        this.common.invalidateEngine();

        const isRoot = (this.handle.context === null || (this.db.root && HandleRegistry.getSoul(this.db.root) === this.handle));
        
        if (!this.handle.ptr && !isRoot) {
             throw new Error(`B"H Error: Cannot set '${String(key)}' on unresolved path: ${this.handle.getPath()}`);
        }
        
        // Promote small objects to full block structures if they grow
        if (this.handle.type === constants.TYPE_SMART_ARRAY) await this._promoteSmartArray();
        if (this.handle.type === constants.TYPE_SMART_OBJECT) await this._promoteSmartObject();

        if (this.handle.type === constants.TYPE_SEQUENCE) {
            await this.seqWriter.set(key, value, options);
        } else {
            await this.mapWriter.set(key, value, options);
        }
    }
    
    async _promoteSmartArray() {
        this.log("Promoting SmartArray to Sequence...");
        const arr = await this.handle.reader.resolveSelf(); 
        const Sequence = require('../../structure/sequence/index.js');
        const SmartPointer = require('../../utils/smartPointer.js');
        const seq = new Sequence(this.db.allocator);
        await seq.create();
        for(const item of arr) {
            const ptr = await this.builder.build(item);
            await seq.push(ptr);
        }
        const newPtr = SmartPointer.block(constants.TYPE_SEQUENCE, seq.ptr.blockId, seq.ptr.length, seq.ptr.isChain, seq.ptr.offset);
        await this.handle._updatePointer(newPtr);
    }
    
    async _promoteSmartObject() {
        this.log("Promoting SmartObject to Dictionary...");
        const obj = await this.handle.reader.resolveSelf();
        const SmartPointer = require('../../utils/smartPointer.js');
        const dict = new Dictionary(this.db.allocator);
        await dict.create();
        for(const k in obj) {
             const ptr = await this.builder.build(obj[k]);
             const encodedKey = keyEncoding.encode(k);
             await dict.set(encodedKey, ptr, { isPtr: true });
        }
        const newPtr = SmartPointer.block(constants.TYPE_DICTIONARY, dict.ptr.blockId, dict.ptr.length, dict.ptr.isChain, dict.ptr.offset);
        await this.handle._updatePointer(newPtr);
    }

    async createMap(key) {
        return this.db.execute(async () => {
            this.log(`Creating Map at [${key}]`);
            this.common.invalidateEngine();
            await this.handle.ensureResolved(true);
            if (this.handle.type === constants.TYPE_SMART_ARRAY) await this._promoteSmartArray();
            if (this.handle.type === constants.TYPE_SMART_OBJECT) await this._promoteSmartObject();

            if (this.handle.type === constants.TYPE_SEQUENCE) {
                await this.seqWriter.createStructureInList(key, 'map');
            } else {
                await this.mapWriter.createStructure(key, 'map');
            }
            this.db.mutationCount++;
        });
    }

    async createObject(key) {
        return this.db.execute(async () => {
            this.log(`Creating Object at [${key}]`);
            this.common.invalidateEngine();
            await this.handle.ensureResolved(true);
            if (this.handle.type === constants.TYPE_SMART_ARRAY) await this._promoteSmartArray();
            if (this.handle.type === constants.TYPE_SMART_OBJECT) await this._promoteSmartObject();

            if (this.handle.type === constants.TYPE_SEQUENCE) {
                await this.seqWriter.createStructureInList(key, 'object');
            } else {
                await this.mapWriter.createStructure(key, 'object');
            }
            this.db.mutationCount++;
        });
    }

    async createList(key) {
        return this.set(key, []);
    }

    async delete(key) {
        return this.db.execute(async () => {
            this.log(`Deleting [${key}]`);
            this.common.invalidateEngine();
            await this.handle.ensureResolved(true);
            if (!this.handle.ptr) return false;
            
            if (this.handle.type === constants.TYPE_SMART_ARRAY) await this._promoteSmartArray();
            if (this.handle.type === constants.TYPE_SMART_OBJECT) await this._promoteSmartObject();
            
            let res = false;
            if (this.handle.type === constants.TYPE_SEQUENCE) {
                res = await this.seqWriter.delete(key);
            } else {
                res = await this.mapWriter.delete(key);
            }
            if (res) this.db.mutationCount++;
            return res;
        });
    }

    async push(value, options = {}) {
        return this.db.execute(async () => {
            this.log(`Pushing value...`);
            await this.handle.ensureResolved(true);
            if (this.handle.type === constants.TYPE_SMART_ARRAY) await this._promoteSmartArray();
            if (this.handle.type !== constants.TYPE_SEQUENCE) throw new Error("B\"H Error: Not a sequence container.");
            await this.seqWriter.push(value, options);
            this.db.mutationCount++;
        });
    }

    async splice(start, deleteCount, ...args) {
        return this.db.execute(async () => {
            this.log(`Splice [start:${start}, del:${deleteCount}]`);
            await this.handle.ensureResolved(true);
            if (this.handle.type === constants.TYPE_SMART_ARRAY) await this._promoteSmartArray();
            if (this.handle.type !== constants.TYPE_SEQUENCE) throw new Error("B\"H Error: Not a sequence container.");
            await this.seqWriter.splice(start, deleteCount, ...args);
            this.db.mutationCount++;
        });
    }

    async compact() {
        return this.db.execute(async () => {
            this.log("Initiating Compaction...");
            await this.handle.ensureResolved(true);
            if (this.handle.type === constants.TYPE_SMART_ARRAY) return true;
            if (this.handle.type === constants.TYPE_SMART_OBJECT) return true;

            let structPtr = await this.common.resolveStructPtr();
            if (!structPtr) return false;

            const type = this.handle.type;
            let engine;
            if (type === constants.TYPE_SEQUENCE) engine = new (require('../../structure/sequence/index.js'))(this.db.allocator, structPtr);
            else if (type === constants.TYPE_MAP) engine = new (require('../../structure/map/index.js'))(this.db.allocator, structPtr);
            else if (type === constants.TYPE_DICTIONARY) engine = new Dictionary(this.db.allocator, structPtr);
            else return false;

            await engine.compact();
            if (engine.ptr.blockId !== structPtr.blockId || engine.ptr.offset !== structPtr.offset) {
                this.log("Compaction Relocated Root.");
                const SmartPointer = require('../../utils/smartPointer.js');
                const newPtr = SmartPointer.block(this.handle.type, engine.ptr.blockId, engine.ptr.length, engine.ptr.isChain, engine.ptr.offset);
                await this.handle._updatePointer(newPtr);
                this.db.mutationCount++;
                return true;
            }
            return false;
        });
    }

    async concat(otherHandle) {
        return this.db.execute(async () => {
            this.log("Concatenating Sequences...");
            this.common.invalidateEngine();
            await this.handle.ensureResolved(true);
            if (this.handle.type === constants.TYPE_SMART_ARRAY) await this._promoteSmartArray();
            if (this.handle.type !== constants.TYPE_SEQUENCE) throw new Error("B\"H Error: Target is not a sequence.");
            
            const otherSoul = HandleRegistry.getSoul(otherHandle);
            if (otherSoul) await otherSoul.ensureResolved();

            if (otherHandle.type === constants.TYPE_SMART_ARRAY) {
                 const otherArr = await otherHandle.reader.resolveSelf();
                 for(const item of otherArr) await this.push(item);
                 return;
            }

            let structPtr = await this.common.resolveStructPtr();
            const seq = await this.common.getEngine(structPtr, constants.TYPE_SEQUENCE);
            
            const SmartPointer = require('../../utils/smartPointer.js');
            const otherPtr = otherSoul ? otherSoul.ptr : null;
            if (!otherPtr) return;

            const Sequence = require('../../structure/sequence/index.js');
            const otherRes = await SmartPointer.resolve(otherPtr, this.db.allocator);
            const otherSeq = new Sequence(this.db.allocator, otherRes);
            await seq.concat(otherSeq);
            await this.common.checkAutoCompact(seq, constants.TYPE_SEQUENCE);
            this.db.mutationCount++;
        });
    }
}
module.exports = Writer;
