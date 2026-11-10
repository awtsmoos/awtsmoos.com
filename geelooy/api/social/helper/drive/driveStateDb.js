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
 */

const fs = require('fs');
const path = require('path');

const AwtsmoosDB = require('../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');

const LAYOUT = 2;
const openByFile = new Map();

function dbFileFor(paths) {
	return path.join(paths.root, 'state.awtsdb');
}

function isDbBackendEnabled() {
	return process.env.AWTSMOOS_DRIVE_STATE_BACKEND === 'awtsmoosdb';
}

function openDb(paths) {
	const file = dbFileFor(paths);
	const existing = openByFile.get(file);
	if (existing) return existing;
	// AwtsmoosDB.open() plants its writable-process lock beside the file,
	// so the alias directory must exist first (a pure read of a fresh
	// alias used to answer freshDriveState from JSON ENOENT instead).
	fs.mkdirSync(paths.root, { recursive: true });
	const db = new AwtsmoosDB(file, { debug: false });
	db.open();
	openByFile.set(file, db);
	return db;
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
	const db = openDb(paths);
	importJsonIfNeeded(db, paths);
	const meta = readMeta(db);
	return meta ? Number(meta.generation || 0) : null;
}

/** Assembles the full plain state object from its per-key vessel. */
function loadAssembledState(paths) {
	const db = openDb(paths);
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
	const db = openDb(paths);
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
