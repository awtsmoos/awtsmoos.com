
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
const Pointer = require('./utils/pointer/crown.js');
const DbVerifier = require('./core/verify.js');
const BlobManager = require('./api/blob/index.js');
const CompactJsonManager = require('./api/compactJson/index.js');
const ConcurrentManager = require('./api/concurrent/index.js');
const TextManager = require('./api/text/index.js');
const TurboWriteBehind = require('./api/turbo/index.js');
const DosDBBridge = require('./api/dosdb/index.js');
const createSQLApi = require('./api/sql/index.js');
const MongoFacade = require('./api/mongo/index.js');
const FirebaseFacade = require('./api/firebase/index.js');
const TableFacade = require('./api/table/index.js');
const createGraphQLApi = require('./api/graphql/index.js');
const SparseArrayManager = require('./api/sparseArray/index.js');
const SchemaManager = require('./api/schema/index.js');
const BackupManager = require('./api/backup/index.js');
const IndexManager = require('./api/indexes/index.js');
const AdminManager = require('./api/admin/index.js');
const TransactionManager = require('./api/transaction/index.js');
const ReplicationManager = require('./api/replication/index.js');
const ProcessLock = require('./core/processLock.js');
const VirtualFs = require('./api/fs/index.js');
const FreeListCodec = require('./core/freeListCodec.js');

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
      reuseFreedSpace: false,
      readOnly: false,
      ...options
    };

    if (this.options.readOnly) {
      this.options.wal = false;
      this.options.reuseFreedSpace = false;
    }

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
    this.concurrent = new ConcurrentManager(this);
    this.blob = new BlobManager(this);
    this.compactJson = new CompactJsonManager(this);
    this.compactJson = new CompactJsonManager(this);
    this.text = new TextManager(this);
    this.turbo = new TurboWriteBehind(this);
    this.DosDB = new DosDBBridge(this);
    this.sparseArrays = new SparseArrayManager(this);
    this.schema = new SchemaManager(this);
    this.backups = new BackupManager(this);
    this.indexes = new IndexManager(this);
    this.admin = new AdminManager(this);
    this.transactions = new TransactionManager(this);
    this.replication = new ReplicationManager(this);
    this.fs = new VirtualFs(this);
    this.tables = new TableFacade(this);
    this.table = (name) => this.tables.table(name);
    this.sql = createSQLApi(this);
    this.graphql = createGraphQLApi(this);
    this.postgres = this.sql.postgres;
    this.mongo = new MongoFacade(this);
    this.ayshyesod = new FirebaseFacade(this);
    this.firebase = this.ayshyesod;

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
    this.freeListPtrRaw = null;
    this.lock = new (require('./core/concurrency.js'))();
    this.processLock = new ProcessLock(filePath);
  }

  /**
   * @method open
   * @description Opens the binary world and resolves the root anchor.
   * @returns {void}
   */
  open() {
    this.processLock.acquire(this.options);
    this.pager.init();
    this.allocator.init();

    const legacySuperblockless = Boolean(this.allocator && this.allocator.legacySuperblockless);
    const sb = this.pager.readExact(0, 64) || Buffer.alloc(64).fill(0);
    const rootSealLength = sb.readUInt8(8);
    if (!legacySuperblockless) {
      this._loadFreeListSeal(sb);
      if (this.turbo && typeof this.turbo.load === 'function') this.turbo.load();
      if (this.sparseArrays && typeof this.sparseArrays.load === 'function') this.sparseArrays.load();
    }

    if (rootSealLength === 0) {
      if (this.options.readOnly) {
        const err = new Error(`B\"H readOnly AwtsmoosDB cannot initialize an empty database: ${this.pager.filePath}`);
        err.code = 'AWTSMOOS_DB_READONLY_EMPTY';
        throw err;
      }
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
    if (!this.options.readOnly && !legacySuperblockless) {
      if (this.schema && typeof this.schema.load === 'function') this.schema.load();
      if (this.indexes && typeof this.indexes.hasStoredIndexes === 'function') this.indexes.hasStoredIndexes();
      if (this.transactions && typeof this.transactions.recover === 'function') this.transactions.recover();
      this._ensureFormatMeta();
    }
  }

  /**
   * @method _flushSuperblock
   * @param {Buffer} [seal=this.rootPtrRaw] - Root seal.
   * @returns {void}
   */
  _flushSuperblock(seal = this.rootPtrRaw) {
    if (this.options.readOnly) throw new Error('B\"H readOnly AwtsmoosDB refused superblock flush');
    if (!seal) return;

    const layout = Buffer.alloc(64).fill(0);
    layout.writeBigUInt64BE(BigInt(this.allocator.cursor), 0);
    layout.writeUInt8(seal.length, 8);
    seal.copy(layout, 9);
    if (this.freeListPtrRaw) {
      layout.writeUInt8(this.freeListPtrRaw.length, 40);
      this.freeListPtrRaw.copy(layout, 41);
    }
    this.pager.writeExact(0, layout);
  }

  /**
   * @method _loadFreeListSeal
   * @description Loads persisted free-list metadata from the superblock.
   * @param {Buffer} sb - Superblock bytes.
   * @returns {void}
   */
  _loadFreeListSeal(sb) {
    const len = sb && sb.length > 40 ? sb.readUInt8(40) : 0;
    if (!len || len > 22) return;

    this.freeListPtrRaw = Buffer.from(sb.subarray(41, 41 + len));

    try {
      const dec = Pointer.decode(this.freeListPtrRaw);
      const raw = this.pager.readExact(dec.offset, dec.length) || Buffer.alloc(0);
      const packed = FreeListCodec.decode(raw);
      const ranges = packed === null
        ? JSON.parse(raw.toString('utf8'))
        : packed;
      this.allocator.freeList = Array.isArray(ranges)
        ? ranges.filter(r => r && r.offset >= 64 && r.length > 0)
        : [];
    } catch (_err) {
      this.freeListPtrRaw = null;
      this.allocator.freeList = [];
    }
  }

  /**
   * @method _saveFreeListSeal
   * @description Persists current free-list metadata as live DB bytes.
   * @returns {void}
   */
  _saveFreeListSeal() {
    if (this.options.readOnly) return;
    const ranges = (this.allocator.freeList || [])
      .filter(r => r && r.offset >= 64 && r.length > 0)
      .map(r => ({ offset: r.offset, length: r.length }));
    const raw = FreeListCodec.encode(ranges);
    const previous = this.options.reuseFreedSpace;
    this.options.reuseFreedSpace = false;

    try {
      const loc = this.allocator.allocate(raw.length);
      if (raw.length) this.pager.writeExact(loc.offset, raw);
      this.freeListPtrRaw = Pointer.encode(constants.VAL_TYPE.BUFFER, loc.offset, raw.length);
      this._flushSuperblock();
    } finally {
      this.options.reuseFreedSpace = previous;
    }
  }

  /**
   * @method close
   * @description Final flush and close.
   * @returns {void}
   */
  close() {
    if (!this.options.readOnly) {
      this.waitForIdle({ closing: true });
      if (this.sparseArrays) this.sparseArrays.flush();
    }
    this.pager.close();
    if (this.processLock) this.processLock.release();
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
   * @method _ensureFormatMeta
   * @description Persists a tiny format/version marker in ordinary data.
   * @returns {void}
   */
  _ensureFormatMeta() {
    if (this.options.readOnly) return;
    if (!this.root.__awtsmoos_meta__) {
      this.root.__awtsmoos_meta__ = { format: 1, createdAt: Date.now() };
    }
  }

  /**
   * @method waitForIdle
   * @param {object} [options={}] - Idle options.
   * @returns {void}
   */
  waitForIdle(options = {}) {
    if (this.options.readOnly) return;
    waitForIdleCore(this, options);
  }

  /**
   * @method batch
   * @param {Function} fn - Work callback.
   * @returns {*} Callback result.
   */
  batch(fn) {
    if (this.options.readOnly) return fn();
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
    const opts = arguments.length > 1 && arguments[1] ? arguments[1] : null;
    const soul = handle && handle[constants.SYMBOLS.INTERNALS];
    if (!soul) return [];
    soul.ensureResolved();
    if (!soul.reader) return [];

    if (!opts) {
      const seen = new Set();
      const out = [];
      for (const key of soul.reader.keys()) {
        const s = String(key);
        if (!seen.has(s)) { seen.add(s); out.push(key); }
      }
      const sparse = this.sparseArrays ? this.sparseArrays.keys(soul) : [];
      for (const key of sparse) {
        const s = String(key);
        if (!seen.has(s)) { seen.add(s); out.push(key); }
      }
      return out;
    }

    const offset = Math.max(0, Number(opts.offset || 0));
    const limit = opts.limit === undefined ? Infinity : Math.max(0, Number(opts.limit || 0));
    const order = opts.order || 'native';
    const overlay = this.turbo && this.turbo.enabled() ? this.turbo.keys(soul) : [];
    const sparse = this.sparseArrays ? this.sparseArrays.keys(soul) : [];
    const seen = new Set();

    function* merged() {
      for (const key of soul.reader.keys()) {
        const s = String(key);
        if (seen.has(s)) continue;
        seen.add(s);
        yield key;
      }
      for (const key of overlay) {
        const s = String(key);
        if (seen.has(s)) continue;
        seen.add(s);
        yield key;
      }
      for (const key of sparse) {
        const s = String(key);
        if (seen.has(s)) continue;
        seen.add(s);
        yield key;
      }
    }

    if (order === 'asc' || order === 'desc') {
      const list = Array.from(merged()).sort((a, b) => String(a).localeCompare(String(b)));
      if (order === 'desc') list.reverse();
      return list.slice(offset, offset + limit);
    }

    const out = [];
    let skipped = 0;
    for (const key of merged()) {
      if (skipped < offset) {
        skipped++;
        continue;
      }
      if (out.length >= limit) break;
      out.push(key);
    }
    return out;
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
   * @method arrayRanges
   * @description Returns stored sparse ranges for an array without expanding gaps.
   * @param {object} handle - Array/sequence handle.
   * @returns {Array<object>} Ranges.
   */
  arrayRanges(handle) {
    const soul = handle && handle[constants.SYMBOLS.INTERNALS];
    return soul && this.sparseArrays ? this.sparseArrays.ranges(soul) : [];
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
   * @method backup
   * @description Creates a full file snapshot or partial JSON path backup.
   * @param {string} target - Target folder/file.
   * @param {object} [options={}] - Backup options.
   * @returns {object} Backup summary.
   */
  backup(target, options = {}) {
    return this.backups.create(target, options);
  }

  /**
   * @method restoreBackup
   * @description Restores from a backup package.
   * @param {string} source - Backup folder/file.
   * @param {object} [options={}] - Restore options.
   * @returns {object} Restore summary.
   */
  restoreBackup(source, options = {}) {
    return this.backups.restore(source, options);
  }

  /**
   * @method transaction
   * @description Runs a rollback transaction.
   * @param {Function} fn - Work callback.
   * @returns {object} Transaction result.
   */
  transaction(fn) {
    return this.transactions.run(fn);
  }

  /**
   * @method _guardWrite
   * @description Runs validation/rule checks before a mutation is accepted.
   * @param {string} path - Logical path.
   * @param {*} value - Incoming value.
   * @param {string} op - Operation name.
   * @returns {void}
   */
  _guardWrite(path, value, op) {
    if (this.options.readOnly) {
      const err = new Error(`B\"H readOnly AwtsmoosDB refused ${op || 'write'} at ${path || '/'}`);
      err.code = 'AWTSMOOS_DB_READONLY_WRITE';
      throw err;
    }
    if (this.schema) this.schema.check(path, value, op);
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

  /**
   * @method info
   * @description Returns a compact runtime database report.
   * @returns {object} Database information.
   */
  info() {
    const stats = this.storageStats();
    const freeBytes = (this.allocator.freeList || []).reduce((sum, gap) => sum + gap.length, 0);

    return {
      path: this.pager.filePath,
      ...stats,
      freeBytes,
      freeRanges: (this.allocator.freeList || []).length,
      memory: this.memoryStats()
    };
  }

  /**
   * @static
   * @method inspectFile
   * @description Reads only filesystem stat and the 64-byte superblock.
   * @param {string} filePath - Database file.
   * @returns {object} File-level info without opening the RAM mirror.
   */
  static inspectFile(filePath) {
    const fs = require('fs');
    const out = {
      path: filePath,
      exists: fs.existsSync(filePath),
      physicalBytes: 0,
      logicalBytes: 0,
      rootSealLength: 0
    };

    if (!out.exists) return out;

    out.physicalBytes = fs.statSync(filePath).size;

    const fd = fs.openSync(filePath, 'r');
    try {
      const header = Buffer.alloc(64);
      fs.readSync(fd, header, 0, Math.min(64, out.physicalBytes), 0);
      out.logicalBytes = Number(header.readBigUInt64BE(0));
      out.rootSealLength = header.readUInt8(8);
    } finally {
      fs.closeSync(fd);
    }

    return out;
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
    this._guardWrite(String(key), value, 'set');
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
    this._guardWrite(String(key), undefined, 'delete');
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
    this._guardWrite(String(key), undefined, 'restore');
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
      pagerBytes: this.pager && typeof this.pager.memoryBytes === 'function'
        ? this.pager.memoryBytes()
        : 0
    };
  }

  /**
   * @method gc
   * @description Lightweight exact-range GC: coalesces free gaps and retracts tail gaps.
   * @returns {object} Reclaimed-space summary.
   */
  gc() {
    if (this.options.readOnly) return { ok: false, readOnly: true, errors: ['readOnly gc refused'] };
    const report = this.verify();
    if (report.ok) {
      this.allocator.freeList = report.free;
      this.allocator._mergeFreeList();
      this.allocator._absorbTrailingGaps();
      this.allocator.flushCursor();
      this._saveFreeListSeal();
    }

    const freeBytes = (this.allocator.freeList || []).reduce((sum, gap) => sum + gap.length, 0);
    return {
      ok: report.ok,
      errors: report.errors,
      freeRanges: (this.allocator.freeList || []).length,
      freeBytes,
      logicalBytes: this.allocator.cursor
    };
  }

  /**
   * @method verify
   * @description Read-only reachability and pointer validation.
   * @returns {object} Verification report.
   */
  verify() {
    return new DbVerifier(this).run();
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
    if (this.options.readOnly) {
      const err = new Error('B\"H readOnly AwtsmoosDB refused chain write');
      err.code = 'AWTSMOOS_DB_READONLY_WRITE';
      throw err;
    }
    if (ptr && ptr.offset !== undefined) {
      this.pager.writeExact(ptr.offset, data);
      this.mutationCount++;
    }
  }
}

module.exports = AwtsmoosDB;
