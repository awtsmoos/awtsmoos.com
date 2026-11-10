//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveStateRepository
 * @description
 * The Awtsmoos joins atomicity and memory: Awtsmoos.com serializes each alias
 * through a lockfile, writes temporary JSON, fsyncs, and renames into truth.
 */

const fs = require('fs');
const crypto = require('crypto');
const { drivePaths } = require('./storagePaths.js');
const { freshDriveState, normalizeDriveState } = require('./stateShape.js');

const LOCK_TIMEOUT_MS = 15000;
const STALE_LOCK_MS = 60000;

// B"H 2026-11-10 (site QA): public reads re-parsed the whole state JSON on
// every request. The state file is replaced atomically (rename) on every
// write, so (mtimeMs, size) is an exact version witness: cache the parsed,
// normalized state per path and serve it until the witness changes.
// mutateDriveState always reads fresh inside its lock and re-seeds the
// cache with the state it just wrote.
const stateReadCache = new Map();

let driveStateDb = null;
function dbBackend() {
	if (process.env.AWTSMOOS_DRIVE_STATE_BACKEND !== 'awtsmoosdb') return null;
	if (!driveStateDb) driveStateDb = require("./driveStateDb.js");
	return driveStateDb;
}



async function readDriveState(aliasId, $i = {}, options = {}) {
	const paths = drivePaths(aliasId, $i);
	const db = dbBackend();
	if (db) {
		const generation = db.dbGeneration(paths);
		if (generation === null) return freshDriveState();
		if (!options.fresh) {
			const cached = stateReadCache.get(paths.state);
			if (cached && cached.dbGeneration === generation) return cached.state;
		}
		const assembled = db.loadAssembledState(paths);
		if (!assembled) return freshDriveState();
		const state = normalizeDriveState(assembled);
		stateReadCache.set(paths.state, { dbGeneration: generation, state });
		return state;
	}
	let witness = null;
	try {
		const stat = await fs.promises.stat(paths.state);
		witness = { mtimeMs: stat.mtimeMs, size: stat.size };
	} catch (error) {
		if (error.code === 'ENOENT') return freshDriveState();
		throw error;
	}
	if (!options.fresh && witness) {
		const cached = stateReadCache.get(paths.state);
		if (cached && cached.mtimeMs === witness.mtimeMs && cached.size === witness.size) {
			return cached.state;
		}
	}
	try {
		const state = normalizeDriveState(JSON.parse(await fs.promises.readFile(paths.state, 'utf8')));
		if (witness) {
			stateReadCache.set(paths.state, { ...witness, state });
		}
		return state;
	} catch (error) {
		if (error.code === 'ENOENT') return freshDriveState();
		throw error;
	}
}

async function mutateDriveState(aliasId, $i, mutator) {
	const paths = drivePaths(aliasId, $i);
	await fs.promises.mkdir(paths.root, { recursive: true });
	const lock = await acquireLock(paths.lock);
	const db = dbBackend();
	if (db) {
		try {
			stateReadCache.delete(paths.state);
			const assembled = db.loadAssembledState(paths);
			const state = normalizeDriveState(assembled || freshDriveState());
			const before = JSON.parse(JSON.stringify(state));
			const result = await mutator(state, paths);
			db.persistStateDiff(paths, before, state);
			stateReadCache.set(paths.state, { dbGeneration: db.dbGeneration(paths), state });
			return result;
		} finally {
			await lock.close().catch(() => {});
			await fs.promises.unlink(paths.lock).catch(() => {});
		}
	}
	try {
		stateReadCache.delete(paths.state);
		const state = await readDriveState(aliasId, $i, { fresh: true });
		const result = await mutator(state, paths);
		await writeJsonAtomic(paths.state, state);
		try {
			const stat = await fs.promises.stat(paths.state);
			stateReadCache.set(paths.state, { mtimeMs: stat.mtimeMs, size: stat.size, state });
		} catch (error) { /* cache re-seed is best-effort */ }
		return result;
	} finally {
		await lock.close().catch(() => {});
		await fs.promises.unlink(paths.lock).catch(() => {});
	}
}

async function writeJsonAtomic(filePath, value) {
	const temporary = `${filePath}.${process.pid}.${crypto.randomBytes(5).toString('hex')}.tmp`;
	const handle = await fs.promises.open(temporary, 'wx', 0o600);
	try {
		// B"H 2026-11-10 (site QA): compact JSON — the state file is a
		// machine store, not a document; pretty-printing taxed every
		// mutation (stringify + write + fsync of ~40% more bytes) and
		// every later parse.
		await handle.writeFile(`${JSON.stringify(value)}\n`, 'utf8');
		await handle.sync();
	} finally {
		await handle.close();
	}
	await fs.promises.rename(temporary, filePath);
}

async function acquireLock(lockPath) {
	const started = Date.now();
	while (Date.now() - started < LOCK_TIMEOUT_MS) {
		try {
			return await fs.promises.open(lockPath, 'wx', 0o600);
		} catch (error) {
			if (error.code !== 'EEXIST') throw error;
			await removeStaleLock(lockPath);
			await sleep(20 + Math.floor(Math.random() * 30));
		}
	}
	const error = new Error('DRIVE_LOCK_TIMEOUT');
	error.code = 'DRIVE_LOCK_TIMEOUT';
	throw error;
}

async function removeStaleLock(lockPath) {
	try {
		const stat = await fs.promises.stat(lockPath);
		if (Date.now() - stat.mtimeMs > STALE_LOCK_MS) {
			await fs.promises.unlink(lockPath);
		}
	} catch (error) {
		if (error.code !== 'ENOENT') throw error;
	}
}

function sleep(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

module.exports = {
	readDriveState,
	mutateDriveState,
	writeJsonAtomic
};
