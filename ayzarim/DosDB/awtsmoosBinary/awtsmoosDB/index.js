
// B"H

/**
 * @file index.js
 * @chapter The Prime Atom Of Unity
 * @description
 * This is the root vessel from which the database opens its eyes.
 * The Awtsmoos renews all worlds at every instant; this class renews the
 * binary world by opening the pager, awakening the allocator, binding the
 * root anchor, and giving the user a live handle into persistence.
 *
 * For lightning tests, AWTSMOOSDB_FAST_TEST=1 skips repeated forced fsync
 * inside waitForIdle(). close() still flushes through pager.close(), so the
 * stone-world still receives its final inscription.
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
const ConcurrencyLock = require('./core/concurrency.js');

/**
 * @class AwtsmoosDB
 * @description
 * The central database vessel.
 *
 * It binds:
 * - Pager: physical bytes.
 * - Allocator: space creation.
 * - Builder: structure inscription.
 * - LiveHandle: normal JS access over persistent data.
 * - Graph/Search/Vector/AI managers: higher perception layers.
 */
class AwtsmoosDB {
  /**
   * @constructor
   * @param {string} filePath - Database file path.
   * @param {object} [options={}] - Runtime options.
   */
  constructor(filePath, options = {}) {
    this.options = {
      debug: false,
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
    this.lock = new ConcurrencyLock();
  }

  /**
   * @method open
   * @description Opens or creates the root database universe.
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
   * @description Writes allocator cursor and root pointer into block zero.
   * @param {Buffer} [seal=this.rootPtrRaw] - Root pointer seal.
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
   * @description Flushes final state and closes the pager.
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
   * @method shouldFastSkipFsync
   * @description
   * Decides whether a test run may skip repeated forced whole-file fsync.
   *
   * @param {object} [options={}] - Idle options.
   * @param {boolean} [options.closing=false] - True during close.
   * @returns {boolean} True when forced fsync may be skipped.
   */
  shouldFastSkipFsync(options = {}) {
    return process.env.AWTSMOOSDB_FAST_TEST === '1' && !options.closing;
  }

  /**
   * @method waitForIdle
   * @description
   * Flushes metadata and drains pending index operations.
   *
   * During the fast test runner this avoids repeated pager.fsync(true), because
   * the final close still seals the file. This turns the suite from dragging
   * stone over stone every assertion into a sharper single final inscription.
   *
   * @param {object} [options={}] - Idle options.
   * @returns {void}
   */
  waitForIdle(options = {}) {
    this._flushSuperblock();

    const list = [...this._pendingIndexOps];
    this._pendingIndexOps = [];

    list.forEach(m => {
      try {
        m();
      } catch (e) {
        if (this.options.debug) console.error(e);
      }
    });

    if (this.search && typeof this.search.flush === 'function') {
      this.search.flush();
    }

    if (!this.shouldFastSkipFsync(options)) {
      this.pager.fsync(true);
    }
  }

  /**
   * @method batch
   * @description Runs many mutations under one final flush.
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
   * @description Returns keys from a live handle.
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
   * @description Returns a sliced key/value walk.
   * @param {object} h - Live handle.
   * @param {*} s - Start key.
   * @param {*} e - End key.
   * @returns {Array<*>} Range result.
   */
  range(h, s, e) {
    const soul = h && h[constants.SYMBOLS.INTERNALS];
    if (!soul) return [];
    soul.ensureResolved();
    return soul.reader && soul.reader.iter ? soul.reader.iter.range(s, e) : [];
  }

  /**
   * @method values
   * @description Returns values from a live handle.
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
   * @description Runs query perception over a handle.
   * @param {object} h - Live handle.
   * @param {object} opts - Query options.
   * @returns {*} Query result.
   */
  query(h, opts) {
    return QueryExecutor.execute(h, opts);
  }

  /**
   * @method createMap
   * @description Creates a persistent Map marker at parent key.
   * @param {object} p - Parent handle.
   * @param {string} k - Key name.
   * @returns {void}
   */
  createMap(p, k) {
    p[k] = new this.Map();
  }

  /**
   * @method createList
   * @description Creates a persistent List marker at parent key.
   * @param {object} p - Parent handle.
   * @param {string} k - Key name.
   * @returns {void}
   */
  createList(p, k) {
    p[k] = new this.List();
  }

  /**
   * @method has
   * @description Checks whether a handle has a key.
   * @param {object} h - Live handle.
   * @param {string} k - Key name.
   * @returns {boolean} True when present.
   */
  has(h, k) {
    const s = h && h[constants.SYMBOLS.INTERNALS];
    if (!s) return false;
    s.ensureResolved();
    return s.nav.resolveKey(k) !== null;
  }

  /**
   * @method _readChainSafe
   * @description Reads raw bytes from a pointer.
   * @param {object} ptr - Pointer object.
   * @returns {Buffer} Data bytes.
   */
  _readChainSafe(ptr) {
    return this.pager.readExact(ptr.offset, ptr.length);
  }

  /**
   * @method _writeChainSafe
   * @description Writes raw bytes to a pointer and bumps mutation count.
   * @param {object} ptr - Pointer object.
   * @param {Buffer} data - Data bytes.
   * @returns {void}
   */
  _writeChainSafe(ptr, data) {
    if (ptr && ptr.offset !== undefined) {
      this.pager.writeExact(ptr.offset, data);
      this.mutationCount++;
    }
  }
}

module.exports = AwtsmoosDB;
