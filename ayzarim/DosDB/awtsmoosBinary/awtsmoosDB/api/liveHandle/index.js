// B"H
/**
 * @file index.js
 * @description
 *  The Yadayim (Hands) of the Database.
 *  Handles the chaining of potentiality (Promises) into actuality (Values).
 *  Modularized Facade.
 */

const TreeManager = require('./tree_manager.js');
const Navigator = require('./navigator.js');
const Reader = require('./reader.js');
const Writer = require('./writer.js');

class LiveHandle {
    /**
     * @param {Object} db - The AwtsmoosDB Instance
     * @param {Promise<Object>} ptrPromise - Resolves to the MetaBlock Ptr
     * @param {string} mode - 'ROOT', 'BTREE', 'COLLECTION', 'VALUE', 'DEFERRED'
     */
    constructor(db, ptrPromise, mode = 'VALUE') {
        this.db = db;
        this.ptrPromise = ptrPromise;
        this.mode = mode;

        // Sub-modules
        this.tree = new TreeManager(this);
        this.nav = new Navigator(this);
        this.reader = new Reader(this, LiveHandle);
        this.writer = new Writer(this);

        return new Proxy(this, {
            get: (target, prop) => {
                if (typeof prop === 'symbol') {
                    if (prop === Symbol.asyncIterator) return target.reader.iterator.bind(target.reader);
                    if (prop === Symbol.toStringTag) return 'LiveHandle';
                    if (prop === Symbol.toPrimitive) return () => `[LiveHandle ${target.mode}]`;
                    return undefined;
                }
                if (prop === 'inspect' || prop === 'valueOf' || prop === 'toString') {
                    return () => `[LiveHandle ${target.mode}]`;
                }

                if (prop === 'then') return (res, rej) => target.reader.resolveSelf().then(res, rej);
                if (prop === 'catch') return (cb) => target.reader.resolveSelf().catch(cb);
                if (prop === 'finally') return (cb) => target.reader.resolveSelf().finally(cb);
                
                if (prop === 'constructor') return LiveHandle;
                if (prop === 'toJSON') return target.reader.toJSON.bind(target.reader);

                if (prop === 'push') return target.writer.push.bind(target.writer);
                // B"H: Added splice
                if (prop === 'splice') return target.writer.splice.bind(target.writer); 
                if (prop === 'slice') return target.reader.slice.bind(target.reader);
                if (prop === 'delete' || prop === 'deleteProperty') return target.writer.delete.bind(target.writer);
                
                if (prop === 'set') return target.writer.set.bind(target.writer);
                
                if (prop === 'createMap') return target.writer.createMap.bind(target.writer);
                if (prop === 'createList') return target.writer.createList.bind(target.writer);

                // B"H: Introspection
                if (prop === 'length') return target.reader.length(); // Returns Promise<number>
                if (prop === 'keys') return target.reader.keys.bind(target.reader);
                if (prop === 'values') return target.reader.values.bind(target.reader);
                if (prop === 'entries') return target.reader.entries.bind(target.reader);

                return target.navigate(prop);
            },
            set: (target, prop, value) => {
                target.db.execute(() => target.writer.set(prop, value))
                    .catch(e => console.error(`[LiveHandle] Set Error on ${prop}:`, e));
                return true; 
            },
            deleteProperty: (target, prop) => {
                target.db.execute(() => target.writer.delete(prop))
                    .catch(e => console.error(`[LiveHandle] Delete Error on ${prop}:`, e));
                return true;
            }
        });
    }

    log(msg) {
        if (this.db && this.db.debug) {
            console.log(`[LiveHandle ${this.mode}] ${msg}`);
        }
    }

    navigate(key) {
        if (typeof key !== 'string') return undefined;

        this.log(`Navigating to child: "${key}"`);
        // Delegate heavy lifting to Navigator, wrap result in new LiveHandle
        const nextPromise = this.nav.resolveChild(key, this.ptrPromise);
        return new LiveHandle(this.db, nextPromise, 'DEFERRED');
    }
}

module.exports = LiveHandle;