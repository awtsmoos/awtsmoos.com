
// B"H

/**
 * @file index.js
 * @chapter The Prime Atom Of Unity
 * @description
 * The root database vessel.
 * Heavy idle logic is split into core/idle.
 * Sequence speed is preserved.
 * Dictionary object-order is fixed at the dictionary layer.
 */

const Pager = require('./core/pager/firmament.js');
const Allocator = require('./core/allocator/chesed.js');
const Builder = require('./structure/manifest/complex/builder.js');
const Handle = require('./api/liveHandle/index.js');
const constants = require('./constants.js');
const GraphManager = require('./api/graph/index.js');
const SearchManager = require('./api/search/index.js');
const VectorManager = require('./api/vector/index.js');
const AIManager = require('./api/ai/index.js');
const QueryExecutor = require('./api/query/index.js');
const waitForIdleCore = require('./core/idle/index.js');
const MetricsTracker = require('./core/metrics/tracker.js');
const PasswordBox = require('./utils/crypto/passwordBox.js');

/**
 * @class AwtsmoosDB
 * @description
 * Main synchronous binary object database.
 */
class AwtsmoosDB {
  /**
   * @constructor
   * @param {string} filePath - Database path.
   * @param {object} [options={}] - Runtime options.
   */
  constructor(filePath, options = {}) {
    this.options = {
      debug: false,
      compression: true,
      autoCompress: true,
      ...options
    };

    this.pager = new Pager(filePath);
    this.pager.db = this;

    this.allocator = new Allocator(this.pager);
    this.allocator.db = this;
    this.allocator.v1 = this.allocator;

    this.builder = new Builder(this.allocator);
    this.primitiveSaver = this.builder.scribe;

    this.graph = new GraphManager(this);
    this.search = new SearchManager(this);
    this.vector = new VectorManager(this);
    this.ai = new AIManager(this);

    this.sysCache = {
      search: new Set(),
      vector: new Set(),
      loaded: true
    };

    this._pendingIndexOps = [];
    this._structureCache = new Map();
    this.metrics = new MetricsTracker();
    this._versions = new Map();
    this.mutationCount = 0;

    this.Map = class {
      constructor() {
        this._isAwtsmoosMap = true;
      }
    };

    this.List = class {
      constructor() {
        this._isAwtsmoosList = true;
      }
    };

    this.Object = class {
      constructor() {
        this._isAwtsmoosObject = true;
      }
    };

    this.root = null;
    this.lock = new (require('./core/concurrency.js'))();
  }

  /**
   * @method open
   * @description Opens the binary world and resolves the root anchor.
   * @returns {void}
   */
  open() {
    this.pager.init();
    this.allocator.init();

    const sb = this.pager.readExact(0, 64) || Buffer.alloc(64).fill(0);
    const rootSealLength = sb.readUInt8(8);

    if (rootSealLength === 0) {
      const DictionaryEngine = require('./structure/dictionary/index.js');
      const StableAnchor = require('./structure/anchor/stable.js');
      const startDict = new DictionaryEngine(this.allocator);
      const apexAnchor = new StableAnchor(this);
      const dataVessel = startDict.create();
      const identitySeal = apexAnchor.create(constants.VAL_TYPE.DICTIONARY, dataVessel);

      this.root = new Handle(this, identitySeal, constants.VAL_TYPE.ANCHOR);
      this.rootPtrRaw = identitySeal;
      this._flushSuperblock(identitySeal);
    } else {
      const rootBytes = sb.subarray(9, 9 + rootSealLength);
      this.root = new Handle(this, rootBytes, constants.VAL_TYPE.ANCHOR);
      this.rootPtrRaw = rootBytes;
    }

    if (this.options.debug) {
      console.log(`B"H - Existence manifests at root address [${this.rootPtrRaw.toString('hex')}]`);
    }
  }

  /**
   * @method _flushSuperblock
   * @param {Buffer} [seal=this.rootPtrRaw] - Root seal.
   * @returns {void}
   */
  _flushSuperblock(seal = this.rootPtrRaw) {
    if (!seal) return;

    const layout = Buffer.alloc(64).fill(0);
    layout.writeBigUInt64BE(BigInt(this.allocator.cursor), 0);
    layout.writeUInt8(seal.length, 8);
    seal.copy(layout, 9);
    this.pager.writeExact(0, layout);
  }

  /**
   * @method close
   * @description Final flush and close.
   * @returns {void}
   */
  close() {
    this.waitForIdle({
      closing: true
    });
    this.pager.close();
    this._structureCache.clear();

    if (this.options.debug) {
      const fs = require('fs');
      if (fs.existsSync(this.pager.filePath)) {
        const phys = fs.statSync(this.pager.filePath).size;
        console.log(`[SIZE_REPORT] physical: ${phys}, pure: ${phys}`);
      }
    }
  }

  /**
   * @method waitForIdle
   * @param {object} [options={}] - Idle options.
   * @returns {void}
   */
  waitForIdle(options = {}) {
    waitForIdleCore(this, options);
  }

  /**
   * @method batch
   * @param {Function} fn - Work callback.
   * @returns {*} Callback result.
   */
  batch(fn) {
    const prevStatus = this.pager.isBatching;
    this.pager.isBatching = true;

    try {
      return fn();
    } finally {
      this.pager.isBatching = prevStatus;
      if (!prevStatus) this.waitForIdle();
    }
  }

  /**
   * @method keys
   * @param {object} handle - Live handle.
   * @returns {Array<string>} Keys.
   */
  keys(handle) {
    const soul = handle && handle[constants.SYMBOLS.INTERNALS];
    if (!soul) return [];
    soul.ensureResolved();
    return soul.reader ? Array.from(soul.reader.keys()) : [];
  }

  /**
   * @method range
   * @param {object} h - Handle.
   * @param {*} s - Start.
   * @param {*} e - End.
   * @returns {Array<*>} Range results.
   */
  range(h, s, e) {
    const soul = h && h[constants.SYMBOLS.INTERNALS];
    if (!soul) return [];
    soul.ensureResolved();
    return soul.reader && soul.reader.iter ? soul.reader.iter.range(s, e) : [];
  }

  /**
   * @method values
   * @param {object} handle - Live handle.
   * @returns {Array<*>} Values.
   */
  values(handle) {
    const soul = handle && handle[constants.SYMBOLS.INTERNALS];
    if (!soul) return [];
    soul.ensureResolved();
    return soul.reader ? Array.from(soul.reader.values()) : [];
  }

  /**
   * @method query
   * @param {object} h - Handle.
   * @param {object} opts - Query options.
   * @returns {*} Query result.
   */
  query(h, opts) {
    return QueryExecutor.execute(h, opts);
  }

  /**
   * @method storageStats
   * @description
   * Returns a byte ledger for density tests and diagnostics. Payload bytes are
   * the content entered through primitive values; logical bytes are the exact
   * database cursor; physical bytes are the current disk body when available.
   *
   * @returns {object} Storage byte statistics.
   */
  storageStats() {
    const fs = require('fs');
    const logicalBytes = this.allocator ? Number(this.allocator.cursor || 0) : 0;
    let physicalBytes = fs.existsSync(this.pager.filePath)
      ? fs.statSync(this.pager.filePath).size
      : (this.pager.currentFileSize || logicalBytes);
    const metrics = this.metrics ? this.metrics.snapshot() : {};

    if (this.pager && this.pager.dirty && typeof this.pager.logicalSize === 'function') {
      physicalBytes = this.pager.logicalSize();
    }

    return {
      ...metrics,
      logicalBytes,
      physicalBytes,
      overheadBytes: Math.max(0, physicalBytes - Number(metrics.payloadBytes || 0))
    };
  }

  createMap(p, k) {
    p[k] = new this.Map();
  }

  createList(p, k) {
    p[k] = new this.List();
  }

  /**
   * @method set
   * @description
   * Legacy root-level assignment API. The AwtsmoosDB root remains the real
   * vessel; this method is only the old doorway, writing one key into it with
   * the same live-handle path used by direct property assignment.
   *
   * @param {string|number} key - Root key.
   * @param {*} value - Value to store.
   * @returns {*} Stored value.
   */
  set(key, value) {
    this.root[key] = value;
    return value;
  }

  /**
   * @method get
   * @description
   * Legacy root-level read API.
   *
   * @param {string|number} key - Root key.
   * @returns {*} Stored value.
   */
  get(key) {
    return this.root[key];
  }

  /**
   * @method delete
   * @description
   * Legacy root-level delete API.
   *
   * @param {string|number} key - Root key.
   * @returns {boolean} True when deletion was accepted.
   */
  delete(key) {
    this._rememberVersion(String(key), this.root[key], true);
    return delete this.root[key];
  }

  /**
   * @method encrypt
   * @description Creates a password-encrypted field value.
   * @param {*} value - JSON-safe value.
   * @param {string} password - Password.
   * @returns {object} Encrypted envelope.
   */
  encrypt(value, password) {
    return PasswordBox.seal(value, password);
  }

  /**
   * @method decrypt
   * @description Opens a value created by encrypt().
   * @param {object} envelope - Stored encrypted value.
   * @param {string} password - Password.
   * @returns {*} Decrypted value.
   */
  decrypt(envelope, password) {
    const value = envelope && envelope.__resolve__ ? envelope.__resolve__() : envelope;
    return PasswordBox.open(value, password);
  }

  /**
   * @method _plain
   * @description Resolves live handles for version snapshots.
   * @param {*} value - Possible live handle.
   * @returns {*} Plain value.
   */
  _plain(value) {
    return value && value.__resolve__ ? value.__resolve__() : value;
  }

  /**
   * @method _rememberVersion
   * @description Keeps optional in-runtime history for undo/restore workflows.
   * @param {string} key - Root key.
   * @param {*} value - Previous value.
   * @param {boolean} deleted - Whether this was deletion.
   * @returns {void}
   */
  _rememberVersion(key, value, deleted) {
    if (this.options.versions === false) return;

    const plain = this._plain(value);
    if (plain === undefined) return;

    const list = this._versions.get(key) || [];
    list.push({ at: Date.now(), deleted: !!deleted, value: plain });
    this._versions.set(key, list);
  }

  /**
   * @method history
   * @description Returns root-key version snapshots.
   * @param {string} key - Root key.
   * @returns {Array<object>} Version list.
   */
  history(key) {
    return (this._versions.get(String(key)) || []).slice();
  }

  /**
   * @method restore
   * @description Restores a previous root-key version.
   * @param {string} key - Root key.
   * @param {number} [index=-1] - Version index.
   * @returns {*} Restored value.
   */
  restore(key, index = -1) {
    const list = this.history(key);
    const item = index < 0 ? list[list.length + index] : list[index];
    if (!item) return undefined;
    this.root[key] = item.value;
    return item.value;
  }

  /**
   * @method memoryStats
   * @description Reports Node memory usage and DB mirror size.
   * @returns {object} Memory stats.
   */
  memoryStats() {
    const usage = process.memoryUsage();
    return {
      rss: usage.rss,
      heapUsed: usage.heapUsed,
      external: usage.external,
      arrayBuffers: usage.arrayBuffers,
      pagerBytes: this.pager && this.pager.memory ? this.pager.memory.length : 0
    };
  }

  /**
   * @method gc
   * @description Lightweight exact-range GC: coalesces free gaps and retracts tail gaps.
   * @returns {object} Reclaimed-space summary.
   */
  gc() {
    if (this.allocator && typeof this.allocator._mergeFreeList === 'function') {
      this.allocator._mergeFreeList();
      this.allocator._absorbTrailingGaps();
      this.allocator.flushCursor();
    }

    const freeBytes = (this.allocator.freeList || []).reduce((sum, gap) => sum + gap.length, 0);
    return {
      freeRanges: (this.allocator.freeList || []).length,
      freeBytes,
      logicalBytes: this.allocator.cursor
    };
  }

  has(h, k) {
    const s = h && h[constants.SYMBOLS.INTERNALS];
    if (!s) return false;
    s.ensureResolved();
    return s.nav.resolveKey(k) !== null;
  }

  _readChainSafe(ptr) {
    return this.pager.readExact(ptr.offset, ptr.length);
  }

  _writeChainSafe(ptr, data) {
    if (ptr && ptr.offset !== undefined) {
      this.pager.writeExact(ptr.offset, data);
      this.mutationCount++;
    }
  }
}

module.exports = AwtsmoosDB;
