//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file storeState.js
 * @chapter The Living Manifest Carries No Duplicate Road Book
 * @description
 * Record-based FS3 manifest. Every inode and every directory child-map is its
 * own native AwtsmoosDB root record:
 *
 *   __fs3_manifest_meta__ -> { __fs3Meta: true, version, nextInode, tx }
 *   __fs3_inode__<id>     -> inode record
 *   __fs3_child__<dirId>  -> { <name>: <childId> }
 *
 * Mutations are write-behind. Touched records accumulate in per-record dirty
 * sets; flush() persists ONLY dirty records inside one db.batch(). Flush cost
 * is O(dirty), never O(manifest). No whole-manifest serialization exists on
 * this path, so RAM stays flat at any file count.
 *
 * A legacy __fs3_manifest__ blob token is read (read-only) or migrated once,
 * on first write, into records. Migration is a data migration; the engine's
 * binary format is untouched.
 */

const codec = require('./manifestCodec.js');
const shape = require('./manifestShape.js');
const { ROOT_INODE } = require('./schema.js');

const MANIFEST_KEY = '__fs3_manifest__'; // legacy blob token: read + migrate only
const META_KEY = '__fs3_manifest_meta__';
const INODE_PREFIX = '__fs3_inode__';
const CHILD_PREFIX = '__fs3_child__';
const DEFAULT_CACHE_BYTES = 8 * 1024 * 1024;
const MAX_CACHE_BYTES = 20 * 1024 * 1024;

function plain(value) {
	return value && value.__resolve__ ? value.__resolve__() : value;
}

// Blob tokens are opaque: never resolve or recurse into them. Their identity
// (id/offset/length/meta) is what db.blob.read needs; resolving could strip
// the __awtsmoosBlob marker or detach them from the live handle.
function isOpaqueToken(value) {
	return !!value && typeof value === 'object' &&
		(value.__awtsmoosBlob === true || value.__fs3ManifestBlob === true);
}

function materializeField(value) {
	if (isOpaqueToken(value)) return value;
	return plain(value);
}

// One-level materialization. v3 records are flat: primitives plus blob tokens.
// Nested values are resolved but never deep-cloned; records are always
// replaced wholesale, never mutated through shared references.
function materialize(value) {
	if (isOpaqueToken(value)) return value;
	const p = plain(value);
	if (!p || typeof p !== 'object') return p;
	if (isOpaqueToken(p)) return p;
	if (Array.isArray(p)) return p.map(materializeField);
	const out = {};
	for (const key of Object.keys(p)) out[key] = materializeField(p[key]);
	return out;
}

function materializeTx(tx) {
	const t = materialize(tx) || {};
	return {
		active: t.active ? materialize(t.active) : null,
		lastCommitted: Number(t.lastCommitted) || 0
	};
}

function assertWritable(db) {
	if (!db.options?.readOnly) return;
	const error = new Error('B"H strict read-only VirtualFs refused mutation');
	error.code = 'AWTSMOOS_DB_READONLY_WRITE';
	throw error;
}

function inodeKey(id) {
	return INODE_PREFIX + id;
}

function childKey(dirId) {
	return CHILD_PREFIX + dirId;
}

function isFs3RecordKey(key) {
	const text = String(key);
	return text === META_KEY ||
		text.startsWith(INODE_PREFIX) ||
		text.startsWith(CHILD_PREFIX);
}

function inodeIdFromKey(key) {
	const text = String(key);
	return text.startsWith(INODE_PREFIX) ? text.slice(INODE_PREFIX.length) : null;
}

function session(db) {
	if (!db.__fs3) {
		db.__fs3 = {
			meta: null,
			metaDirty: false,
			cache: new Map(),
			cacheBytes: 0,
			dirty: new Set(),
			tombstones: new Set()
		};
	}
	const s = db.__fs3;
	if (!s.meta) loadMeta(db, s);
	return s;
}

function loadMeta(db, s) {
	const rawMeta = materialize(db.root[META_KEY]);
	if (rawMeta && rawMeta.__fs3Meta === true) {
		s.meta = {
			version: 3,
			nextInode: Number.isSafeInteger(rawMeta.nextInode) ? rawMeta.nextInode : 1,
			tx: materializeTx(rawMeta.tx)
		};
		return;
	}
	const legacy = plain(db.root[MANIFEST_KEY]);
	if (legacy && (legacy.__fs3ManifestBlob === true || (legacy.version === 3 && legacy.inodes))) {
		const error = new Error('B"H FS3 legacy manifest requires explicit vacuum migration before online access');
		error.code = 'AWTSMOOS_FS3_LEGACY_MIGRATION_REQUIRED';
		throw error;
	}
	s.meta = { version: 3, nextInode: 1, tx: { active: null, lastCommitted: 0 } };
	if (db.options?.readOnly) return;
	s.metaDirty = true;
	writeRecord(db, s, inodeKey(ROOT_INODE), shape.rootInodeRecord());
	writeRecord(db, s, childKey(ROOT_INODE), {});
}

function cacheBudget(db) {
	const requested = Number(db.options?.virtualFsCacheBytes);
	if (!Number.isFinite(requested) || requested <= 0) return DEFAULT_CACHE_BYTES;
	return Math.min(Math.floor(requested), MAX_CACHE_BYTES);
}

function approximateBytes(key, value) {
	let bytes = Buffer.byteLength(String(key), 'utf8') + 64;
	if (!value || typeof value !== 'object') return bytes + 16;
	for (const [k, v] of Object.entries(value)) {
		bytes += Buffer.byteLength(String(k), 'utf8') + 16;
		if (typeof v === 'string') bytes += Buffer.byteLength(v, 'utf8');
		else if (Buffer.isBuffer(v)) bytes += v.length;
		else if (typeof v === 'number' || typeof v === 'boolean') bytes += 8;
		else bytes += 64; // opaque blob tokens / shallow metadata only
	}
	return bytes;
}

function cacheDelete(s, key) {
	const entry = s.cache.get(key);
	if (!entry) return;
	s.cache.delete(key);
	s.cacheBytes = Math.max(0, s.cacheBytes - entry.bytes);
}

function cacheSet(db, s, key, value) {
	cacheDelete(s, key);
	const bytes = approximateBytes(key, value);
	s.cache.set(key, { value, bytes });
	s.cacheBytes += bytes;
	const budget = cacheBudget(db);
	for (const [candidate] of s.cache) {
		if (s.cacheBytes <= budget) break;
		if (!s.dirty.has(candidate)) cacheDelete(s, candidate);
	}
}

function cacheGet(s, key) {
	const entry = s.cache.get(key);
	if (!entry) return undefined;
	// LRU: recently read records move to the tail.
	s.cache.delete(key);
	s.cache.set(key, entry);
	return entry.value;
}

function readRecord(db, s, key) {
	if (s.tombstones.has(key)) return null;
	if (s.cache.has(key)) return cacheGet(s, key);
	const raw = db.root[key];
	if (raw === undefined || raw === null) return null;
	const value = materialize(raw);
	if (value === null || typeof value !== 'object') return null;
	cacheSet(db, s, key, value);
	return value;
}

function writeRecord(db, s, key, value) {
	assertWritable(db);
	cacheSet(db, s, key, value);
	s.tombstones.delete(key);
	s.dirty.add(key);
	// Bound long-lived writers too. Flush only between logical FS transactions;
	// a transaction may temporarily exceed the cache budget but cannot leak it
	// into the next operation.
	if (!db.__fs3BatchDepth && s.cacheBytes > cacheBudget(db)) flush(db);
}

function deleteRecord(db, s, key) {
	assertWritable(db);
	cacheDelete(s, key);
	s.dirty.delete(key);
	s.tombstones.add(key);
}

function readInode(db, id) {
	if (!id) return null;
	return readRecord(db, session(db), inodeKey(id));
}

function writeInode(db, inode) {
	writeRecord(db, session(db), inodeKey(inode.id), inode);
}

function removeInode(db, id) {
	const s = session(db);
	deleteRecord(db, s, inodeKey(id));
}

function readChildren(db, dirId) {
	if (!dirId) return null;
	return readRecord(db, session(db), childKey(dirId));
}

function writeChildren(db, dirId, map) {
	writeRecord(db, session(db), childKey(dirId), map);
}

function removeChildren(db, dirId) {
	const s = session(db);
	deleteRecord(db, s, childKey(dirId));
}

function forceDurableBoundary(db) {
	if (db.allocator?.flushCursor) db.allocator.flushCursor();
	if (db._flushSuperblock) db._flushSuperblock();
	if (db.pager?.fsync) db.pager.fsync(true);
}

function flush(db) {
	if (db.options?.readOnly) return false;
	const s = db.__fs3;
	if (!s || (!s.metaDirty && s.dirty.size === 0 && s.tombstones.size === 0)) return false;
	assertWritable(db);
	db.batch(() => {
		if (s.metaDirty && s.meta) {
			db.root[META_KEY] = {
				__fs3Meta: true,
				version: 3,
				nextInode: s.meta.nextInode,
				tx: s.meta.tx
			};
			s.metaDirty = false;
		}
		for (const key of s.dirty) {
			const value = cacheGet(s, key);
			if (value !== undefined) db.root[key] = value;
		}
		s.dirty.clear();
		for (const key of s.tombstones) {
			delete db.root[key];
		}
		s.tombstones.clear();
	});
	forceDurableBoundary(db);
	return true;
}

function root(db) {
	const s = session(db);
	return {
		version: 3,
		nextInode: s.meta.nextInode,
		tx: s.meta.tx
	};
}

function markTx(db, tx) {
	const s = session(db);
	assertWritable(db);
	s.meta.tx = {
		active: tx.active ? materialize(tx.active) : null,
		lastCommitted: Number(tx.lastCommitted) || 0
	};
	s.metaDirty = true;
	return s.meta.tx;
}

function allocateInode(db) {
	const s = session(db);
	assertWritable(db);
	const id = `i${s.meta.nextInode++}`;
	s.metaDirty = true;
	return id;
}

// Compatibility snapshot of the historical in-memory manifest shape
// ({ version, nextInode, tx, inodes, children }). O(n): prefer the record
// APIs. Merges unflushed cache writes so the view is truthful without
// forcing a flush.
function manifest(db) {
	const s = session(db);
	const keys = new Set();
	for (const key of db.keys(db.root)) {
		if (isFs3RecordKey(key)) keys.add(String(key));
	}
	for (const key of s.cache.keys()) {
		if (isFs3RecordKey(key)) keys.add(key);
	}
	const inodes = {};
	const children = {};
	for (const key of keys) {
		if (s.tombstones.has(key)) continue;
		const value = s.cache.has(key) ? cacheGet(s, key) : readRecord(db, s, key);
		if (!value) continue;
		if (key.startsWith(INODE_PREFIX)) inodes[inodeIdFromKey(key)] = value;
		else if (key.startsWith(CHILD_PREFIX)) {
			children[key.slice(CHILD_PREFIX.length)] = value;
		}
	}
	return {
		version: 3,
		nextInode: s.meta.nextInode,
		tx: { ...s.meta.tx },
		inodes,
		children
	};
}

const recordKeys = {
	MANIFEST_KEY,
	META_KEY,
	INODE_PREFIX,
	CHILD_PREFIX,
	inodeKey,
	childKey
};

module.exports = {
	LEGACY_MANIFEST_KEY: MANIFEST_KEY,
	allocateInode,
	flush,
	inodeIdFromKey,
	isFs3RecordKey,
	manifest,
	markTx,
	meta: root,
	readChildren,
	readInode,
	recordKeys,
	removeChildren,
	removeInode,
	root,
	writeChildren,
	writeInode
};
