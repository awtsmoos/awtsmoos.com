
// B"H
/**
 * @file db.js
 * @description
 * The main container of worlds. Here, the local binary format (Awtsmoos Binary)
 * meets the infinite cloud. If Firebase or Firestore config is provided, the 
 * database reroutes its core reads and writes through the cloud adapters, 
 * ascending from the local dust into the networked heavens.
 * 
 * Every read is a revelation. Every write is a new creation.
 * We use the AdapterFactory to decide whether to talk to RTDB or Firestore.
 */

var path = require("path");
var fs = require("fs");

var serializeValue = require("./awtsmoosBinaryJSON/serialize/serializeValue.js");
var directlyParseValue = require("./awtsmoosBinaryJSON/parsing/direct.js");
var FileBuffer = require("./fileBuffer.js");
var AwtsmoosHashMap = require("./awtsmoosBinaryJSON/helpers/hashing/AwtsmoosHashMap.js");
var { ensureDir } = require("./helpers.js");

class AwtsmoosDB {
    /**
     * @constructor
     * @param {string} dbDir - Local directory path.
     * @param {Object} options - Config options.
     */
    constructor(dbDir, {
        hashMapInitialCapacity = 8,
        shardByteSize = 1024,
        firebase = null
    } = {}) {
        this.dir = dbDir || "./awtsmoosDb";
        this.hashMapCapacity = hashMapInitialCapacity;
        this.hashEntrySize = 4;
        this.shardByteSize = shardByteSize;
        
        this.cloudAdapter = null;

        // If a config exists, we use the Factory to manifest the Chariot
        if (firebase && (firebase.databaseURL || firebase.project_id || firebase.serviceAccount)) {
            const AdapterFactory = require("./firebase/AdapterFactory.js");
            this.cloudAdapter = AdapterFactory.create(firebase);
        } else {
            this.ensureDir();
        }
    }

    _isCloudMode() {
        return this.cloudAdapter !== null;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CORE CRUD API — Routing to Cloud if Active
    // ═══════════════════════════════════════════════════════════════════════

    async getHashEntry(key) {
        if (this._isCloudMode()) {
            return await this.cloudAdapter.read(key);
        }
        return this._localGetHashEntry(key);
    }

    async addHashValueToIndex(key, value) {
        if (this._isCloudMode()) {
            await this.cloudAdapter.write(key, value);
            return { success: true };
        }
        return this._localAddHashValueToIndex(key, value);
    }

    async removeHashEntry(key) {
        if (this._isCloudMode()) {
            await this.cloudAdapter.remove(key);
            return { success: true };
        }
        return { success: true };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // LOCAL IMPLEMENTATIONS — Preserving the Legacy Awtsmoos Format
    // ═══════════════════════════════════════════════════════════════════════

    _localGetHashEntry(key) {
        var masterIndex = this.getMasterIndex();
        var masterDataBuffer = this.getMasterIndexValues();
        var masterMap = new AwtsmoosHashMap({
            buffer: masterIndex,
            dataBuffer: masterDataBuffer
        });

        var masterRaw = masterMap.getValueAtKey(key);

        var parst = directlyParseValue(masterRaw);
        if (!parst) return null;
        
        var shardIdx = parst.shardIdx;
        var shardBuffer = this.findShardIfExists(shardIdx);

        if (!shardBuffer) return null;

        var hash = this.hashMap(shardBuffer);
        var rawValue = hash.getValueAtKey(key);
        return directlyParseValue(rawValue);
    }

    _localAddHashValueToIndex(key, value) {
        var serialized = serializeValue(value);
        var shardAvailable = this.findShardWithEnoughSpaceInDir(serialized.length);

        if (shardAvailable.error) return shardAvailable;

        var hash = this.hashMap(shardAvailable);
        var { offsetInData } = hash.setEntry(key, serialized);

        var masterMap = new AwtsmoosHashMap({
            buffer: this.getMasterIndex(),
            dataBuffer: this.getMasterIndexValues()
        });

        masterMap.setEntry(key, serializeValue({
            offsetInData,
            shardIdx: shardAvailable.shardIdx
        }));

        return { success: serialized };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SHARED HELPER METHODS
    // ═══════════════════════════════════════════════════════════════════════

    getMasterIndexValues() {
        var p = path.join(this.dir, "master.awts");
        if (!fs.existsSync(p)) ensureDir(p);
        return new FileBuffer(p);
    }

    getMasterIndex() {
        var p = path.join(this.dir, "index.awts");
        if (!fs.existsSync(p)) ensureDir(p);
        return new FileBuffer(p);
    }

    findShardIfExists(idx) {
        var p = path.join(this.dir, `shard-${idx}.awts`);
        return fs.existsSync(p) ? { shardBuffer: new FileBuffer(p), shardIdx: idx } : null;
    }

    findShardWithEnoughSpaceInDir(size, idx = 0) {
        var p = path.join(this.dir, `shard-${idx}.awts`);
        try {
            if (fs.existsSync(p)) {
                var s = fs.statSync(p);
                if (s.size + size < this.shardByteSize) return { shardBuffer: new FileBuffer(p), shardIdx: idx };
                return this.findShardWithEnoughSpaceInDir(size, idx + 1);
            }
            ensureDir(p);
            return { shardBuffer: new FileBuffer(p), shardIdx: idx };
        } catch(e) { return { error: e }; }
    }
    
    hashMap({ shardBuffer, shardIdx = 0 }) {
        var p = path.join(this.dir, "index-" + shardIdx + ".awts");
        if (!fs.existsSync(p)) ensureDir(p);
        return new AwtsmoosHashMap({ buffer: new FileBuffer(p), dataBuffer: shardBuffer });
    }
    
    getFile(p) { try { return fs.readFileSync(p); } catch (e) { return null; } }
    
    ensureDir(dir = this.dir) { if (dir) ensureDir(dir); }
}

module.exports = AwtsmoosDB;
