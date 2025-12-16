

// B"H
const Navigator = require('./navigator.js');
const Writer = require('./writer.js');
const Reader = require('./reader.js');
const constants = require('../../constants.js');
const Query = require('../query/index.js');
const SmartPointer = require('../../utils/smartPointer.js');

class LiveHandleV2 {
    constructor(db, ptrBuffer, type, context = null) {
        this.db = db;
        this.ptr = ptrBuffer;
        this.type = type;
        this.context = context; // { parent: LiveHandle, key: string }
        this.isLiveHandle = true; // B"H: Identification Flag
        
        this.nav = new Navigator(this);
        this.writer = new Writer(this);
        this.reader = new Reader(this);

        return new Proxy(this, {
            get: (target, prop, receiver) => {
                if (prop === 'ptr') return target.ptr;
                if (prop === 'db') return target.db;
                if (prop === 'type') return target.type;
                if (prop === 'context') return target.context;
                if (prop === 'isLiveHandle') return true;
                if (prop === 'getPath') return target.getPath.bind(target);
                if (prop === 'ensureResolved') return target.ensureResolved.bind(target);

                // Promise Interface -> Triggers Resolution
                if (prop === 'then') return (res, rej) => target.reader.resolveSelf().then(res, rej);
                if (prop === 'catch') return (cb) => target.reader.resolveSelf().catch(cb);
                if (prop === 'finally') return (cb) => target.reader.resolveSelf().finally(cb);
                
                // Methods
                if (prop === 'push') return target.writer.push.bind(target.writer);
                if (prop === 'set') return target.writer.set.bind(target.writer);
                if (prop === 'splice') return target.writer.splice.bind(target.writer);
                if (prop === 'delete' || prop === 'deleteProperty') return target.writer.delete.bind(target.writer);
                
                if (prop === 'createMap') return target.writer.createMap.bind(target.writer);
                if (prop === 'createObject') return target.writer.createObject.bind(target.writer); // B"H: New Method
                if (prop === 'createList') return target.writer.createList.bind(target.writer);
                
                if (prop === 'concat') return target.writer.concat.bind(target.writer);

                // B"H: Map-like Accessors
                if (prop === 'get') return (key) => target.nav.navigate(key);
                if (prop === 'has') return async (key) => {
                    const child = target.nav.navigate(key);
                    await child.ensureResolved();
                    return !!child.ptr;
                };

                if (prop === 'slice') return target.reader.slice.bind(target.reader);
                // B"H: Range Seek Support (with safety check)
                if (prop === 'range') {
                    if (typeof target.reader.range !== 'function') {
                        throw new Error(`B"H: Reader.range is not implemented. Check reader.js.`);
                    }
                    return target.reader.range.bind(target.reader);
                }
                
                if (prop === 'keys') return target.reader.keys.bind(target.reader);
                if (prop === 'values') return target.reader.values.bind(target.reader);
                if (prop === 'entries') return target.reader.entries.bind(target.reader);
                if (prop === 'length') return target.reader.length(); 
                if (prop === 'byteSize') return target.reader.byteSize();
                
                if (prop === 'stats') return target.reader.stats.bind(target.reader);
                if (prop === 'compact') return target.writer.compact.bind(target.writer);
                
                // B"H: Pass receiver (Proxy) to Query so it can access traps like .length and .get()
                if (prop === 'query') return (q) => Query.execute(receiver, q);
                if (prop === Symbol.asyncIterator) return target.reader.iterator.bind(target.reader);

                if (prop === '_updatePointer') return target._updatePointer.bind(target);
                if (prop === 'writer') return target.writer;
                if (prop === 'reader') return target.reader;
                if (prop === 'nav') return target.nav;

                // Graph
                if (prop === 'relateTo') return (targetNode, label, props) => target.db.graph.connect(target, targetNode, label, props);
                if (prop === 'relationships') return (dir, label) => target.db.graph.getRelationships(target, dir, label);
                if (prop === 'path') return (targetNode, opts) => target.db.graph.shortestPath(target, targetNode, opts);
                if (prop === 'traverse') return (visitor, opts) => target.db.graph.traverse(target, visitor, opts);

                // Search & Vector
                if (prop === 'enableSearch') return () => target.db.search.enableIndex(target.getPath());
                if (prop === 'search') return (query) => target.db.search.search(target.getPath(), query);
                if (prop === 'enableVectorIndex') return (opts) => target.db.vector.enableVectorIndex(target.getPath(), opts);
                if (prop === 'nearest') return (queryVec, k) => target.db.vector.nearest(target.getPath(), queryVec, k);

                // B"H: Safe String Conversion to prevent "object is not a function" crashes
                if (prop === 'toString' || prop === Symbol.toStringTag || prop === 'valueOf') {
                    return () => `[LiveHandle ${target.getPath()}]`;
                }
                if (prop === Symbol.toPrimitive) {
                    return () => `[LiveHandle ${target.getPath()}]`;
                }
                // Node.js console.log inspection
                if (prop === Symbol.for('nodejs.util.inspect.custom')) {
                    return () => `[LiveHandle ${target.getPath()}]`;
                }

                // Array Index Access (Numeric String)
                if (typeof prop === 'string' && !isNaN(prop) && Number.isInteger(parseFloat(prop))) {
                     // B"H: Return a Deferred Handle for the index.
                     // The Reader will resolve it to the item value if awaited.
                     return target.nav.navigate(prop);
                }

                // Child Navigation (Synchronous)
                return target.nav.navigate(prop);
            },
            set: (target, prop, value) => {
                // Returns Promise (async set)
                target.writer.set(prop, value);
                return true;
            },
            deleteProperty: (target, prop) => {
                target.writer.delete(prop);
                return true;
            }
        });
    }

    /**
     * B"H: Lazy Resolution Mechanism.
     * Ensures this handle has a valid PTR and TYPE by consulting its parent.
     */
    async ensureResolved() {
        if (this.ptr) return; // Already resolved
        if (this === this.db.root) return; // Root is always resolved

        if (this.context && this.context.parent) {
            // 1. Ensure Parent is resolved
            await this.context.parent.ensureResolved();
            
            // console.log(`B"H LiveHandle.ensureResolved [${this.getPath()}] Parent Resolved. Looking up key: ${this.context.key}`);

            // 2. Ask Parent's Navigator to find our Key
            const result = await this.context.parent.nav.resolveKey(this.context.key);
            
            if (result) {
                // console.log(`B"H LiveHandle.ensureResolved [${this.getPath()}] FOUND! Type: ${result.type}`);
                this.ptr = result.ptr;
                this.type = result.type;
            } else {
                // console.log(`B"H LiveHandle.ensureResolved [${this.getPath()}] NOT FOUND.`);
                // Key does not exist in DB yet.
                // This is valid for a Handle we are about to write to.
                // But for reading, it remains unresolved (ptr=null).
            }
        }
    }

    static async resolvePointer(ptr, db) {
        const LH = require('./index.js');
        const SP = require('../../utils/smartPointer.js');
        const decoded = SP.decode(ptr);
        if(!decoded) return null;
        
        const temp = new LH(db, ptr, decoded.type, null);
        return await temp.reader.resolveSelf();
    }

    getPath() {
        const parts = [];
        let curr = this.context;
        while (curr) {
            parts.unshift(String(curr.key));
            curr = curr.parent ? curr.parent.context : null;
        }
        return parts.length > 0 ? parts.join('.') : 'root';
    }

    async _updatePointer(newPtrBuffer) {
        // console.log(`B"H LiveHandle._updatePointer [${this.getPath()}] Updating Pointer...`);
        this.ptr = newPtrBuffer;
        if (this.context && this.context.parent) {
            await this.context.parent.ensureResolved();
            // B"H: Pass options object with skipFree: true to prevent recursive destruction of the old pointer location.
            // When a structure moves (e.g. Map resize), the old location is cleaned up by the structure itself.
            // The parent just needs to point to the new location without killing the children (which are shared).
            await this.context.parent.writer._setRaw(this.context.key, newPtrBuffer, { isPtr: true, skipFree: true });
        } else if (this.db.root === this) {
            // console.log(`B"H LiveHandle._updatePointer [ROOT] Updating SuperBlock...`);
            const decoded = SmartPointer.decode(newPtrBuffer);
            if (decoded && decoded.mode === constants.MODE_BLOCK) {
                const blockId = require('../../utils/binaryHelpers.js').readPointer48(decoded.payload, 0);
                const len = decoded.payload.readUInt32BE(6);
                const off = decoded.payload.readUInt32BE(10);
                const isChain = decoded.payload.readUInt8(14) === 1;
                
                await this.db.allocator.v1.updateSuperBlock((sb) => {
                    require('../../utils/binaryHelpers.js').writePointer48(sb, blockId, 64);
                    sb.writeUInt32BE(len, 70);
                    sb.writeUInt32BE(off, 74);
                    sb.writeUInt8(isChain ? 1 : 0, 78);
                });
                this.db.rootBlockId = blockId;
            }
        }
    }
}
module.exports = LiveHandleV2;