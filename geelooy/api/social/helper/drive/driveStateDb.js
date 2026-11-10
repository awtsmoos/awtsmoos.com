//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module DriveStateDb
 * @description
 * AwtsmoosDB-backed storage for one alias's drive state, behind the
 * AWTSMOOS_DRIVE_STATE_BACKEND=awtsmoosdb flag (stateRepository decides).
 * The state keeps its exact JSON shape; only the vessel changes: every
 * top-level section and every drive entry is its own key, so a mutation
 * persists only the keys it actually changed — in one db.batch() —
 * instead of rewriting a whole state.json.
 *
 * Values are stored as JSON strings. The engine's live handles are
 * function-typed proxies: nested arrays do not survive a live round
 * trip as arrays, while strings come back byte-exact. First touch
 * imports the existing state.json once; the JSON file stays on disk
 * untouched as the rollback witness.
 *
 * Locking: the engine grants ONE exclusive writer per file, and that
 * is right — two writers must never diverge. But custody is not a
 * wall: readers open SHARED (readOnly) and coexist with the writer,
 * and a would-be writer waits a bounded time for custody instead of
 * failing instantly — the same contract the old lockfile gave.
 * The owning process (the service) holds its writer instance per
 * alias; any other process reads through a shared handle and only
 * takes custody when it truly needs to write.
 */

const fs = require('fs');
const path = require('path');

const AwtsmoosDB = require('../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');

const LAYOUT = 2;
const READER_PROBE_WAIT_MS = 300;
const WRITER_WAIT_MS = 15000;
const openByFile = new Map();

function dbFileFor(paths) {
	return path.join(paths.root, 'state.awtsdb');
}

function isDbBackendEnabled() {
	return process.env.AWTSMOOS_DRIVE_STATE_BACKEND === 'awtsmoosdb';
}

function openInstance(paths, mode, lockWaitMs) {
	const file = dbFileFor(paths);
	// AwtsmoosDB.open() plants its process lock beside the file, so the
	// alias directory must exist first (a pure read of a fresh alias
	// used to answer freshDriveState from JSON ENOENT instead).
	fs.mkdirSync(paths.root, { recursive: true });
	const db = new AwtsmoosDB(file, {
		debug: false,
		readOnly: mode === 'shared',
		lockWaitMs
	});
	db.open();
	const entry = { db, mode };
	openByFile.set(file, entry);
	return entry;
}

function closeInstance(file) {
	const entry = openByFile.get(file);
	if (!entry) return;
	openByFile.delete(file);
	try {
		entry.db.close();
	} catch { /* a failed close must not mask the caller's real work */ }
}

function isBusy(error) {
	return error?.code === 'AWTSMOOS_DB_LOCK_BUSY';
}

/**
 * The handle for reads: the cached instance when this process already
 * holds one; otherwise a brief probe for writer custody, falling back
 * to a shared read-only handle when another process owns the vessel.
 */
function readDb(paths) {
	const file = dbFileFor(paths);
	const cached = openByFile.get(file);
	if (cached) return cached.db;
	try {
		return openInstance(paths, 'exclusive', READER_PROBE_WAIT_MS).db;
	} catch (error) {
		if (!isBusy(error)) throw error;
		return openInstance(paths, 'shared', 0).db;
	}
}

/**
 * The handle for writes: cached writer when held; a shared handle is
 * released first, then custody is awaited with the old lockfile's
 * patience (15s) rather than refused on sight.
 */
function writeDb(paths) {
	const file = dbFileFor(paths);
	const cached = openByFile.get(file);
	if (cached?.mode === 'exclusive') return cached.db;
	if (cached) closeInstance(file);
	return openInstance(paths, 'exclusive', WRITER_WAIT_MS).db;
}

function isReadOnly(db) {
	return db?.options?.readOnly === true;
}

function readMeta(db) {
	try {
		const raw = db.root.metaJson;
		if (typeof raw !== 'string') return null;
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

/** One-time import from state.json when the DB vessel is still empty. */
function importJsonIfNeeded(db, paths) {
	const meta = readMeta(db);
	if (meta && meta.layout === LAYOUT) return false;
	if (isReadOnly(db)) return false;
	let parsed = null;
	try {
		parsed = JSON.parse(fs.readFileSync(paths.state, 'utf8'));
	} catch {
		parsed = null;
	}
	const sections = {};
	let entries = {};
	if (parsed && typeof parsed === 'object') {
		for (const [key, value] of Object.entries(parsed)) {
			if (key === 'entries') entries = value || {};
			else sections[key] = value;
		}
	}
	db.batch(() => {
		db.root.sections = {};
		for (const [key, value] of Object.entries(sections)) {
			db.root.sections[key] = JSON.stringify(value);
		}
		db.root.entries = {};
		for (const [entryPath, entry] of Object.entries(entries)) {
			db.root.entries[entryPath] = JSON.stringify(entry);
		}
		db.root.metaJson = JSON.stringify({ layout: LAYOUT, generation: 1, importedFromJson: Boolean(parsed) });
	});
	return true;
}

/** Current generation counter, or null when no DB state exists yet. */
function dbGeneration(paths) {
	const db = readDb(paths);
	importJsonIfNeeded(db, paths);
	const meta = readMeta(db);
	return meta ? Number(meta.generation || 0) : null;
}

/** Assembles the full plain state object from its per-key vessel. */
function loadAssembledState(paths) {
	const db = readDb(paths);
	importJsonIfNeeded(db, paths);
	if (!readMeta(db)) return null;
	const assembled = {};
	const liveSections = db.root.sections;
	if (liveSections) {
		for (const key of Object.keys(liveSections)) {
			assembled[key] = parseStored(liveSections[key]);
		}
	}
	assembled.entries = {};
	const liveEntries = db.root.entries;
	if (liveEntries) {
		for (const entryPath of Object.keys(liveEntries)) {
			assembled.entries[entryPath] = parseStored(liveEntries[entryPath]);
		}
	}
	return assembled;
}

function parseStored(raw) {
	if (typeof raw === 'string') {
		try {
			return JSON.parse(raw);
		} catch {
			return raw;
		}
	}
	return raw;
}

/**
 * Persists only what changed between the pre-mutation snapshot and the
 * mutated state: changed/deleted sections and entries, in one batch,
 * then bumps the generation so read caches re-assemble exactly once.
 */
function persistStateDiff(paths, before, after) {
	const db = writeDb(paths);
	importJsonIfNeeded(db, paths);
	const beforeSections = withoutEntries(before);
	const afterSections = withoutEntries(after);
	const beforeEntries = (before && before.entries) || {};
	const afterEntries = (after && after.entries) || {};
	// Keys are set/deleted directly on the live containers; reassigning a
	// container to its own live proxy silently persists nothing here.
	if (!db.root.sections) db.root.sections = {};
	if (!db.root.entries) db.root.entries = {};
	db.batch(() => {
		for (const key of new Set([...Object.keys(beforeSections), ...Object.keys(afterSections)])) {
			const next = afterSections[key] === undefined ? null : JSON.stringify(afterSections[key]);
			const prev = beforeSections[key] === undefined ? null : JSON.stringify(beforeSections[key]);
			if (next === prev) continue;
			if (next === null) delete db.root.sections[key];
			else db.root.sections[key] = next;
		}
		for (const key of new Set([...Object.keys(beforeEntries), ...Object.keys(afterEntries)])) {
			const next = afterEntries[key] === undefined ? null : JSON.stringify(afterEntries[key]);
			const prev = beforeEntries[key] === undefined ? null : JSON.stringify(beforeEntries[key]);
			if (next === prev) continue;
			if (next === null) delete db.root.entries[key];
			else db.root.entries[key] = next;
		}
		const meta = readMeta(db) || { layout: LAYOUT, generation: 0 };
		meta.generation = Number(meta.generation || 0) + 1;
		db.root.metaJson = JSON.stringify(meta);
	});
}

function withoutEntries(state) {
	if (!state || typeof state !== 'object') return {};
	const { entries, ...sections } = state;
	return sections;
}

module.exports = {
	dbFileFor,
	dbGeneration,
	isDbBackendEnabled,
	loadAssembledState,
	persistStateDiff
};
