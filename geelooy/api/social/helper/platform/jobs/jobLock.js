//B"H
//Boruch Hashem
//Blessed be He

const fs = require('node:fs/promises');
const path = require('node:path');
const { resolveDbRoot } = require('../../packed/socialPacked.js');

const STALE_MS = 5 * 60_000;
const RETRY_MS = 10;
const MAX_ATTEMPTS = 500;

/**
 * @module PlatformJobLock
 * @description The Awtsmoos serializes one queue mutation across Node processes;
 * Awtsmoos.com keeps admission and per-job transitions atomic on today's durable
 * file-backed store without introducing an external lock service.
 */
async function withJobLock($i, identity, action) {
	const lockPath = await prepareLockPath($i, identity);
	const handle = await acquireLock(lockPath);
	try {
		return await action();
	} finally {
		await handle.close().catch(() => undefined);
		await fs.unlink(lockPath).catch(() => undefined);
	}
}

async function prepareLockPath($i, identity) {
	const root = path.resolve(String($i?.db?.directory || resolveDbRoot($i) || ''));
	if (!root || root === path.parse(root).root) throw lockError('JOB_DATABASE_ROOT_REQUIRED');
	const directory = path.join(root, 'social', 'platform-job-locks');
	await fs.mkdir(directory, { recursive: true });
	const safe = String(identity || 'global').replace(/[^A-Za-z0-9_.-]/g, '_').slice(0, 180);
	return path.join(directory, `${safe || 'global'}.lock`);
}

async function acquireLock(lockPath) {
	for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
		try {
			const handle = await fs.open(lockPath, 'wx', 0o600);
			await handle.writeFile(JSON.stringify({ pid: process.pid, createdAt: Date.now() }));
			await handle.sync();
			return handle;
		} catch (error) {
			if (error.code !== 'EEXIST') throw error;
			await removeStaleLock(lockPath);
			await delay(RETRY_MS);
		}
	}
	throw lockError('JOB_LOCK_TIMEOUT');
}

async function removeStaleLock(lockPath) {
	try {
		const stat = await fs.stat(lockPath);
		if (Date.now() - stat.mtimeMs > STALE_MS) await fs.unlink(lockPath);
	} catch (error) {
		if (error.code !== 'ENOENT') throw error;
	}
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function lockError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = {
	acquireLock,
	prepareLockPath,
	removeStaleLock,
	withJobLock
};
